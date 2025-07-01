package models

import (
	"gorm.io/gorm"
	"time"
)

type Comment struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	TicketID  uint           `json:"ticketId"`
	Author    string         `json:"author"`
	Text      string         `json:"text"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
