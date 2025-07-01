package handlers

import (
	"net/http"
	"strconv"
	"gofirst-backend/internal/models"
	"gofirst-backend/internal/repository"
	"github.com/gin-gonic/gin"
)

type CommentHandler struct {
	Repo *repository.CommentRepository
	ActivityRepo *repository.ActivityRepository
}

func NewCommentHandler(repo *repository.CommentRepository, activityRepo *repository.ActivityRepository) *CommentHandler {
	return &CommentHandler{Repo: repo, ActivityRepo: activityRepo}
}

func (h *CommentHandler) GetComments(c *gin.Context) {
	ticketID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ticket ID"})
		return
	}
	comments, err := h.Repo.GetByTicketID(uint(ticketID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, comments)
}

func (h *CommentHandler) CreateComment(c *gin.Context) {
	ticketID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ticket ID"})
		return
	}
	var comment models.Comment
	if err := c.ShouldBindJSON(&comment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	comment.TicketID = uint(ticketID)
	if err := h.Repo.Create(&comment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// Log activity
	activity := models.Activity{
		TicketID: comment.TicketID,
		Type:    "comment_added",
		Message: "Comment added",
	}
	h.ActivityRepo.CreateActivity(&activity)
	c.JSON(http.StatusCreated, comment)
}
