package models

import (
	"gorm.io/gorm"
	"time"
)

type Ticket struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	TicketNumber string        `gorm:"uniqueIndex" json:"ticketNumber"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Status      string         `json:"status"`
	Assignee    string         `json:"assignee"`
	DueDate     *time.Time     `json:"dueDate"`
	Priority    string         `json:"priority"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
