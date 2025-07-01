package repository

import (
	"gorm.io/gorm"
	"gofirst-backend/internal/models"
)

type AttachmentRepository struct {
	DB *gorm.DB
}

func NewAttachmentRepository(db *gorm.DB) *AttachmentRepository {
	return &AttachmentRepository{DB: db}
}

func (r *AttachmentRepository) CreateAttachment(att *models.Attachment) error {
	return r.DB.Create(att).Error
}

func (r *AttachmentRepository) GetAttachmentsByTicketID(ticketID uint) ([]models.Attachment, error) {
	var atts []models.Attachment
	err := r.DB.Where("ticket_id = ?", ticketID).Order("uploaded_at asc").Find(&atts).Error
	return atts, err
}

func (r *AttachmentRepository) DeleteAttachment(id uint) error {
	return r.DB.Delete(&models.Attachment{}, id).Error
}
