package handlers

import (
	"net/http"
	"strconv"
	"gofirst-backend/internal/repository"
	"gofirst-backend/internal/models"
	"github.com/gin-gonic/gin"
)

type ActivityHandler struct {
	Repo *repository.ActivityRepository
}

func NewActivityHandler(repo *repository.ActivityRepository) *ActivityHandler {
	return &ActivityHandler{Repo: repo}
}

func (h *ActivityHandler) GetActivitiesByTicketID(c *gin.Context) {
	idStr := c.Param("id")
	ticketID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ticket ID"})
		return
	}
	activities, err := h.Repo.GetActivitiesByTicketID(uint(ticketID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch activities"})
		return
	}
	c.JSON(http.StatusOK, activities)
}

func (h *ActivityHandler) CreateActivity(c *gin.Context) {
	var activity models.Activity
	if err := c.ShouldBindJSON(&activity); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	if err := h.Repo.CreateActivity(&activity); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create activity"})
		return
	}
	c.JSON(http.StatusCreated, activity)
}
