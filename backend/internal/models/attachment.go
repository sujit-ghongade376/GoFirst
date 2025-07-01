package models

import (
	"time"
)

type Attachment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	TicketID  uint      `json:"ticketId"`
	Filename  string    `json:"filename"`
	Filepath  string    `json:"filepath"`
	UploadedAt time.Time `json:"uploadedAt"`
}
