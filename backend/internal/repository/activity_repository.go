package repository

import (
	"gorm.io/gorm"
	"gofirst-backend/internal/models"
)

type ActivityRepository struct {
	DB *gorm.DB
}

func NewActivityRepository(db *gorm.DB) *ActivityRepository {
	return &ActivityRepository{DB: db}
}

func (r *ActivityRepository) CreateActivity(activity *models.Activity) error {
	return r.DB.Create(activity).Error
}

func (r *ActivityRepository) GetActivitiesByTicketID(ticketID uint) ([]models.Activity, error) {
	var activities []models.Activity
	err := r.DB.Where("ticket_id = ?", ticketID).Order("created_at asc").Find(&activities).Error
	return activities, err
}
