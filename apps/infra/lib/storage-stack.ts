import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

interface StorageStackProps extends cdk.StackProps {
  stage: 'dev' | 'prod'; // 환경 구분용 변수
}

export class StorageStack extends cdk.Stack {
  readonly bucketName: string; // 다른 스택이나 출력 참조용

  constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id, props);

    const isProd = props.stage === 'prod';

    // 1. S3 버킷 정의
    const bucket = new s3.Bucket(this, 'MainUploadBucket', {
      // 버킷 이름 (전세계 고유해야 함, 환경별 구분 추천)
      bucketName: `board-playground-upload-${props.stage}`,

      // 보안: 퍼블릭 액세스 차단 (필요시 수정)
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,

      // 암호화: S3 관리형 키 사용
      encryption: s3.BucketEncryption.S3_MANAGED,

      // 버전 관리: 파일 덮어쓰기 방지 (운영 환경 추천)
      versioned: isProd,

      // 삭제 정책:
      // Prod: 스택 삭제해도 버킷 유지 (RETAIN)
      // Dev: 스택 삭제하면 버킷도 삭제 (DESTROY)
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,

      // Dev 환경 편의성: 버킷 안에 파일이 있어도 강제 삭제 허용
      autoDeleteObjects: !isProd,

      // CORS 설정 (프론트엔드에서 직접 업로드 시 필요)
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
          allowedOrigins: ['*'], // 실제 운영 시에는 도메인 지정 권장 (ex: https://my-app.com)
          allowedHeaders: ['*'],
        },
      ],
    });

    this.bucketName = bucket.bucketName;

    const paramName = `/board-playground/${props.stage}/s3/bucket-name`;

    new ssm.StringParameter(this, 'BucketNameParam', {
      parameterName: paramName,
      stringValue: bucket.bucketName,
      description: `S3 Bucket name for ${props.stage} environment`,
    });

    // 2. 출력 (콘솔에 버킷 이름 표시)
    new cdk.CfnOutput(this, 'BucketNameOutput', {
      value: bucket.bucketName,
      description: 'The name of the S3 bucket',
    });
  }
}
