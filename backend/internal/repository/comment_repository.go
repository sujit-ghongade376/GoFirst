package repository

import (
	"gofirst-backend/internal/models"
	"gorm.io/gorm"
)

type CommentRepository struct {
	DB *gorm.DB
}

func NewCommentRepository(db *gorm.DB) *CommentRepository {
	return &CommentRepository{DB: db}
}

func (r *CommentRepository) GetByTicketID(ticketID uint) ([]models.Comment, error) {
	var comments []models.Comment
	err := r.DB.Where("ticket_id = ?", ticketID).Order("created_at asc").Find(&comments).Error
	return comments, err
}

func (r *CommentRepository) Create(comment *models.Comment) error {
	return r.DB.Create(comment).Error
}
