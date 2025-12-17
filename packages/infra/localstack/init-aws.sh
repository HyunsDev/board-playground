#!/bin/bash

# 1. S3 Bucket 생성
echo "Creating S3 Bucket..."
awslocal s3 mb s3://board-playground-bucket

# 2. SQS Queue 생성
echo "Creating SQS Queue..."
awslocal sqs create-queue --queue-name board-playground-queue

# 3. (선택사항) 리소스 확인
echo "Listing Buckets:"
awslocal s3 ls
echo "Listing Queues:"
awslocal sqs list-queues