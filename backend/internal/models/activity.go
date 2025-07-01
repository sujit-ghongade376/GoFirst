package models

import (
	"time"
)

type Activity struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	TicketID  uint      `json:"ticketId"`
	Type      string    `json:"type"` // e.g., created, updated, status_changed, comment_added
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"createdAt"`
}
