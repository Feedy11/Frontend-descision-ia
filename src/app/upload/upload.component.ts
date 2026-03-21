import { Component, OnInit }                     from '@angular/core';
import { CommonModule }                           from '@angular/common';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { ToastrService }                          from 'ngx-toastr';

// ── Types ─────────────────────────────────────────────────────
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

// Réponse backend POST /api/v1/upload
interface DatasetUploadResponse {
  id               : number;
  filename         : string;
  original_filename: string;
  file_size        : number;
  file_type        : string;
  status           : 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  row_count        : number | null;
  column_count     : number | null;
  created_at       : string;
}

// Réponse backend GET /api/v1/datasets
interface DatasetListResponse {
  datasets  : DatasetUploadResponse[];
  total     : number;
  page      : number;
  page_size : number;
}

// Historique local affiché dans la sidebar
interface RecentUpload {
  id    : number;
  name  : string;
  date  : string;
  size  : string;
  type  : 'csv' | 'xlsx';
  status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
}

const ACCEPTED_EXTS = ['.csv', '.xlsx', '.xls'];
const MAX_SIZE_MB   = 100; // ia-serv accepte 100MB

@Component({
  selector   : 'app-upload',
  standalone : true,
  imports    : [CommonModule],
  templateUrl: './upload.component.html',
  styleUrl   : './upload.component.css'
})
export class UploadComponent implements OnInit {

  private readonly IA_API = 'http://localhost:8001/api/v1';

  //files
  selectedFile : File | null = null;
  fileSize                   = '';
  isCsv                      = false;

  //Drag & Drop
  isDragging                 = false;

  //upload
  uploadStatus  : UploadStatus = 'idle';
  uploadProgress               = 0;
  errorMessage                 = '';

  //Dataset uploadé (réponse backend)
  lastDataset: DatasetUploadResponse | null = null;

  // Historique (depuis le backend)
  recentUploads: RecentUpload[] = [];

  constructor(
    private http  : HttpClient,
    private toastr: ToastrService
  ) {}
  ngOnInit(): void {
    this.loadRecentDatasets();
  }

  private loadRecentDatasets(): void {
    this.http.get<DatasetListResponse>(`${this.IA_API}/datasets?page=1&page_size=5`)
      .subscribe({
        next: (res) => {
          this.recentUploads = res.datasets.map(d => ({
            id    : d.id,
            name  : d.original_filename,
            date  : new Date(d.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short',
                      hour: '2-digit', minute: '2-digit'
                    }),
            size  : this.formatSize(d.file_size),
            type  : d.file_type === 'csv' ? 'csv' : 'xlsx',
            status: d.status
          }));
        },
        error: () => {}
      });
  }

  //Drag events
  onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging = false;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging = false;
    const file = e.dataTransfer?.files[0];
    if (file) this.setFile(file);
  }

  // Sélection via input
  onFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (file) this.setFile(file);
    input.value = '';
  }

  //Valider et stocker
  private setFile(file: File): void {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!ACCEPTED_EXTS.includes(ext)) {
      this.toastr.error(
        `Format non supporté : ${ext}. Utilisez CSV, XLSX ou XLS.`,
        'Fichier invalide',
        { timeOut: 4000, progressBar: true }
      );
      return;
    }

    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > MAX_SIZE_MB) {
      this.toastr.error(
        `Le fichier dépasse ${MAX_SIZE_MB} MB (${sizeMB.toFixed(1)} MB).`,
        'Fichier trop lourd',
        { timeOut: 4000, progressBar: true }
      );
      return;
    }

    this.selectedFile   = file;
    this.fileSize       = this.formatSize(file.size);
    this.isCsv          = ext === '.csv';
    this.uploadStatus   = 'idle';
    this.uploadProgress = 0;
    this.lastDataset    = null;

    this.toastr.info(
      `${file.name} sélectionné (${this.fileSize})`,
      'Fichier prêt',
      { timeOut: 2500, progressBar: true }
    );
  }

  //Supprimer
  removeFile(): void {
    this.selectedFile   = null;
    this.fileSize       = '';
    this.uploadStatus   = 'idle';
    this.uploadProgress = 0;
    this.errorMessage   = '';
    this.lastDataset    = null;
  }

  reset(): void {
    this.removeFile();
    this.loadRecentDatasets(); // rafraîchir la liste
  }

  //  Upload vers ia-serv

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.uploadStatus   = 'uploading';
    this.uploadProgress = 0;
    this.errorMessage   = '';

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    const req = new HttpRequest(
      'POST',
      `${this.IA_API}/upload`,
      formData,
      { reportProgress: true }
    );

    this.http.request<DatasetUploadResponse>(req).subscribe({

      next: (event) => {
        // Progression de l'upload
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round(100 * event.loaded / event.total);
        }

        // Réponse finale du serveur (201 Created)
        if (event.type === HttpEventType.Response && event.body) {
          this.lastDataset  = event.body;
          this.uploadStatus = 'success';

          this.toastr.success(
            `${this.selectedFile?.name} importé ! ID Dataset : #${event.body.id}`,
            'Import réussi ✅',
            { timeOut: 5000, progressBar: true }
          );

          // Rafraîchir la liste des imports récents
          this.loadRecentDatasets();
        }
      },

      error: (err) => {
        this.uploadStatus = 'error';
        this.errorMessage = err.error?.detail || 'Erreur lors de l\'import.';

        this.toastr.error(
          this.errorMessage,
          'Erreur d\'import ',
          { timeOut: 5000, progressBar: true }
        );
      }
    });
  }

  //Supprimer un dataset
  deleteDataset(id: number, name: string): void {
    this.http.delete(`${this.IA_API}/datasets/${id}`).subscribe({
      next: () => {
        this.recentUploads = this.recentUploads.filter(r => r.id !== id);
        this.toastr.success(
          `${name} supprimé.`,
          'Suppression réussie',
          { timeOut: 3000, progressBar: true }
        );
      },
      error: () => {
        this.toastr.error(
          'Impossible de supprimer ce dataset.',
          'Erreur',
          { timeOut: 3000, progressBar: true }
        );
      }
    });
  }

  //Badge couleur selon le statut backend
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      UPLOADED  : 'status-uploaded',
      PROCESSING: 'status-processing',
      PROCESSED : 'status-processed',
      FAILED    : 'status-failed'
    };
    return map[status] ?? '';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      UPLOADED  : '⏳',
      PROCESSING: '🔄',
      PROCESSED : '✓',
      FAILED    : '✗'
    };
    return map[status] ?? '?';
  }

  //Format taille
  private formatSize(bytes: number): string {
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}
