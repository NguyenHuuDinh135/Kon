resource "aws_secretsmanager_secret" "app_secrets" {
  name                    = "${var.project_name}/app-secrets"
  description             = "Application secrets for Kon ERP services"
  recovery_window_in_days = 0

  tags = {
    Name = "${var.project_name}-app-secrets"
  }
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id

  secret_string = jsonencode({
    DATABASE_URL    = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/${var.db_name}"
    GOOGLE_API_KEY  = var.google_api_key
    KAGGLE_USERNAME = var.kaggle_username
    KAGGLE_KEY      = var.kaggle_key
    JWT_SECRET_KEY  = var.jwt_secret_key
    DB_USER         = var.db_username
    DB_PASSWORD     = var.db_password
    DB_NAME         = var.db_name
    DB_HOST         = aws_db_instance.postgres.address
    DB_PORT         = "5432"
  })
}
