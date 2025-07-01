package repository

import (
	"gorm.io/gorm"
	"gofirst-backend/internal/models"
)

type TicketRepository struct {
	DB *gorm.DB
}

func NewTicketRepository(db *gorm.DB) *TicketRepository {
	return &TicketRepository{DB: db}
}

func (r *TicketRepository) Create(ticket *models.Ticket) error {
	return r.DB.Create(ticket).Error
}

func (r *TicketRepository) GetAll() ([]models.Ticket, error) {
	var tickets []models.Ticket
	err := r.DB.Find(&tickets).Error
	return tickets, err
}

func (r *TicketRepository) GetByID(id uint) (*models.Ticket, error) {
	var ticket models.Ticket
	err := r.DB.First(&ticket, id).Error
	return &ticket, err
}

func (r *TicketRepository) Update(ticket *models.Ticket) error {
	return r.DB.Save(ticket).Error
}

func (r *TicketRepository) Delete(id uint) error {
	return r.DB.Delete(&models.Ticket{}, id).Error
}
