
**Draft**


# Architecture
**Frontend** hosted separately on AWS S3 + CloudFront (CDN)
**Backend + Containers** on EC2

```
┌─────────────────┐         ┌──────────────────┐
│  S3 + CloudFront│         │   EC2 Instance   │
│   (Frontend)    │────────>│  - NGINX         │
│     ctf.com     │  API    │  - Backend       │
│                 │  calls  │  - Docker        │
└─────────────────┘         └──────────────────┘
```


