import { Component, OnInit } from '@angular/core';
import { FooterComponent } from "../footer/footer.component";
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-chatbox',
  standalone: true,
  imports: [FooterComponent],
  templateUrl: './chatbox.component.html',
  styleUrl: './chatbox.component.css'
})
export class ChatboxComponent implements OnInit {
  constructor(private viewportScroller: ViewportScroller) { }

  ngOnInit(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
  }
}
