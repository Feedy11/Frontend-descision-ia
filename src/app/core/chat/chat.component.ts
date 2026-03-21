import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {

  inputMessage = '';
  messages: any[] = [];
  isTyping = false;
  isLoading = false;
  attachedFile: string | null = null;
  searchQuery = '';

  sendMessage() {
    if (!this.inputMessage.trim()) return;

    this.messages.push({
      role: 'user',
      content: this.inputMessage
    });

    this.inputMessage = '';
  }

  onEnterKey(event: any) {
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  newChat() {
    this.messages = [];
  }

  clearChat() {
    this.messages = [];
  }

  attachFile() {
    this.attachedFile = "example.csv";
  }

  removeFile() {
    this.attachedFile = null;
  }

  useSuggestion(text: string) {
    this.inputMessage = text;
  }

}