package main

import (
	"log"
	"gofirst-backend/internal/models"
	"gofirst-backend/internal/repository"
	"gofirst-backend/internal/handlers"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
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

	r.Run(":8080")
}
