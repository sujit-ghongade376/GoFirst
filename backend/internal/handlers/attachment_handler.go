package handlers

import (
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"
	"gofirst-backend/internal/repository"
	"gofirst-backend/internal/models"
	"github.com/gin-gonic/gin"
)

type AttachmentHandler struct {
	Repo *repository.AttachmentRepository
}

func NewAttachmentHandler(repo *repository.AttachmentRepository) *AttachmentHandler {
	return &AttachmentHandler{Repo: repo}
}

func (h *AttachmentHandler) UploadAttachment(c *gin.Context) {
	ticketIDStr := c.Param("id")
	ticketID, err := strconv.Atoi(ticketIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ticket ID"})
		return
	}
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	dir := "uploads"
	os.MkdirAll(dir, 0755)
	filename := filepath.Base(file.Filename)
	filepath := filepath.Join(dir, time.Now().Format("20060102150405")+"_"+filename)
	if err := c.SaveUploadedFile(file, filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}
	att := models.Attachment{
		TicketID:  uint(ticketID),
		Filename:  filename,
		Filepath:  filepath,
		UploadedAt: time.Now(),
	}
	if err := h.Repo.CreateAttachment(&att); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save attachment"})
		return
	}
	c.JSON(http.StatusCreated, att)
}

func (h *AttachmentHandler) ListAttachments(c *gin.Context) {
	ticketIDStr := c.Param("id")
	ticketID, err := strconv.Atoi(ticketIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ticket ID"})
		return
	}
	atts, err := h.Repo.GetAttachmentsByTicketID(uint(ticketID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch attachments"})
		return
	}
	c.JSON(http.StatusOK, atts)
}

func (h *AttachmentHandler) DeleteAttachment(c *gin.Context) {
	idStr := c.Param("attachmentId")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid attachment ID"})
		return
	}
	if err := h.Repo.DeleteAttachment(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete attachment"})
		return
	}
	c.Status(http.StatusNoContent)
}
