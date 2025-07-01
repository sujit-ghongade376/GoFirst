package handlers

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gofirst-backend/internal/models"
	"gofirst-backend/internal/repository"
)

type TicketHandler struct {
	Repo        *repository.TicketRepository
	ActivityRepo *repository.ActivityRepository
}

func NewTicketHandler(repo *repository.TicketRepository, activityRepo *repository.ActivityRepository) *TicketHandler {
	return &TicketHandler{Repo: repo, ActivityRepo: activityRepo}
}

func (h *TicketHandler) CreateTicket(c *gin.Context) {
	// Debug: print incoming JSON
	body, _ := io.ReadAll(c.Request.Body)
	log.Printf("Incoming ticket JSON: %s", string(body))
	c.Request.Body = io.NopCloser(bytes.NewBuffer(body))

	var ticket models.Ticket
	if err := c.ShouldBindJSON(&ticket); err != nil {
		log.Printf("Bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log.Printf("Parsed ticket struct after binding: %+v", ticket)
	// Save ticket without ticket number to get the ID
	if err := h.Repo.Create(&ticket); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	log.Printf("Ticket struct after saving: %+v", ticket)
	// Generate user-friendly ticket number if not provided
	if ticket.TicketNumber == "" {
		ticket.TicketNumber = fmt.Sprintf("TICKET-%d", ticket.ID)
		h.Repo.Update(&ticket)
	}
	// Log activity
	activity := models.Activity{
		TicketID: ticket.ID,
		Type:    "created",
		Message: fmt.Sprintf("Ticket created: %s", ticket.Title),
	}
	h.ActivityRepo.CreateActivity(&activity)
	c.JSON(http.StatusCreated, ticket)
}

func (h *TicketHandler) GetTickets(c *gin.Context) {
	tickets, err := h.Repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, tickets)
}

func (h *TicketHandler) GetTicketByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	ticket, err := h.Repo.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
		return
	}
	c.JSON(http.StatusOK, ticket)
}

func (h *TicketHandler) UpdateTicket(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	// Debug: print incoming JSON
	body, _ := io.ReadAll(c.Request.Body)
	log.Printf("Incoming ticket JSON: %s", string(body))
	c.Request.Body = io.NopCloser(bytes.NewBuffer(body))

	var ticket models.Ticket
	if err := c.ShouldBindJSON(&ticket); err != nil {
		log.Printf("Bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log.Printf("Parsed ticket struct after binding: %+v", ticket)
	ticket.ID = uint(id)
	if err := h.Repo.Update(&ticket); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// Log activity
	activity := models.Activity{
		TicketID: ticket.ID,
		Type:    "updated",
		Message: fmt.Sprintf("Ticket updated: %s", ticket.Title),
	}
	h.ActivityRepo.CreateActivity(&activity)
	c.JSON(http.StatusOK, ticket)
}

func (h *TicketHandler) DeleteTicket(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	if err := h.Repo.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
