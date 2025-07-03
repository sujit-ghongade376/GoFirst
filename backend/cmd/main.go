package main

import (
	"gofirst-backend/internal/handlers"
	"gofirst-backend/internal/models"
	"gofirst-backend/internal/repository"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	db, err := gorm.Open(sqlite.Open("tickets.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database: ", err)
	}
	db.AutoMigrate(&models.Ticket{})
	db.AutoMigrate(&models.Comment{})
	db.AutoMigrate(&models.Activity{})
	db.AutoMigrate(&models.Attachment{})

	activityRepo := repository.NewActivityRepository(db)
	activityHandler := handlers.NewActivityHandler(activityRepo)

	repo := repository.NewTicketRepository(db)
	handler := handlers.NewTicketHandler(repo, activityRepo)

	commentRepo := repository.NewCommentRepository(db)
	commentHandler := handlers.NewCommentHandler(commentRepo, activityRepo)

	attachmentRepo := repository.NewAttachmentRepository(db)
	attachmentHandler := handlers.NewAttachmentHandler(attachmentRepo)

	r := gin.Default()
	r.Use(cors.Default())

	// Root handler for health check or landing
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "GoFirst API is running"})
	})

	r.GET("/api/tickets", handler.GetTickets)
	r.GET("/api/tickets/:id", handler.GetTicketByID)
	r.POST("/api/tickets", handler.CreateTicket)
	r.PUT("/api/tickets/:id", handler.UpdateTicket)
	r.DELETE("/api/tickets/:id", handler.DeleteTicket)

	// Comment endpoints
	r.GET("/api/tickets/:id/comments", commentHandler.GetComments)
	r.POST("/api/tickets/:id/comments", commentHandler.CreateComment)

	// Activity endpoints
	r.GET("/api/tickets/:id/activities", activityHandler.GetActivitiesByTicketID)
	r.POST("/api/activities", activityHandler.CreateActivity)

	// Attachment endpoints
	r.POST("/api/tickets/:id/attachments", attachmentHandler.UploadAttachment)
	r.GET("/api/tickets/:id/attachments", attachmentHandler.ListAttachments)
	r.DELETE("/api/attachments/:attachmentId", attachmentHandler.DeleteAttachment)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
