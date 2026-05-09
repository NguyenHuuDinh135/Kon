output "alb_dns_name" {
  description = "ALB DNS name (app URL)"
  value       = aws_lb.main.dns_name
}

output "alb_web_url" {
  description = "Web app URL (port 80)"
  value       = "http://${aws_lb.main.dns_name}"
}

output "alb_api_url" {
  description = "API URL (port 8000)"
  value       = "http://${aws_lb.main.dns_name}:8000"
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_address" {
  description = "RDS PostgreSQL address (without port)"
  value       = aws_db_instance.postgres.address
}

output "ecr_web_repository_url" {
  description = "ECR repository URL for web service"
  value       = aws_ecr_repository.web.repository_url
}

output "ecr_api_repository_url" {
  description = "ECR repository URL for API service"
  value       = aws_ecr_repository.api.repository_url
}

output "ecr_worker_repository_url" {
  description = "ECR repository URL for worker service"
  value       = aws_ecr_repository.worker.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}
