variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "kon"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "PostgreSQL master password"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "kon_erp_northwind"
}

variable "google_api_key" {
  description = "Google Gemini API key"
  type        = string
  sensitive   = true
}

variable "kaggle_username" {
  description = "Kaggle username for dataset downloads"
  type        = string
  sensitive   = true
}

variable "kaggle_key" {
  description = "Kaggle API key"
  type        = string
  sensitive   = true
}

variable "jwt_secret_key" {
  description = "JWT signing secret (32+ characters)"
  type        = string
  sensitive   = true
}
