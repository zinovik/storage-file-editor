### create artifact repository

```bash
gcloud services enable artifactregistry.googleapis.com
gcloud artifacts repositories create zinovik-repository --location=europe-central2 --repository-format=docker
```

### create service accounts

```bash
gcloud iam service-accounts create github-actions
gcloud iam service-accounts create storage-file-editor
```

### add roles (`Service Account User`, `Cloud Build Service Account` and `Viewer`) to the service account you want to use to deploy the cloud run

```bash
gcloud projects add-iam-policy-binding zinovik-project --member="serviceAccount:github-actions@zinovik-project.iam.gserviceaccount.com" --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding zinovik-project --member="serviceAccount:github-actions@zinovik-project.iam.gserviceaccount.com" --role="roles/cloudbuild.builds.builder"

gcloud projects add-iam-policy-binding zinovik-project --member="serviceAccount:github-actions@zinovik-project.iam.gserviceaccount.com" --role="roles/viewer"
```

### creating keys for service account for github-actions `GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY_FILE`

```bash
gcloud iam service-accounts keys create key-file.json --iam-account=github-actions@zinovik-project.iam.gserviceaccount.com
cat key-file.json | base64
```

### add access to secrets and buckets

```bash
gcloud projects add-iam-policy-binding zinovik-project --member="serviceAccount:storage-file-editor@zinovik-project.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"

gcloud storage buckets add-iam-policy-binding gs://zinovik-gallery --member="serviceAccount:storage-file-editor@zinovik-project.iam.gserviceaccount.com" --role="roles/storage.admin"

gcloud storage buckets add-iam-policy-binding gs://digital-board-games --member="serviceAccount:storage-file-editor@zinovik-project.iam.gserviceaccount.com" --role="roles/storage.admin"

gcloud storage buckets add-iam-policy-binding gs://hedgehogs --member="serviceAccount:storage-file-editor@zinovik-project.iam.gserviceaccount.com" --role="roles/storage.admin"

gcloud storage buckets add-iam-policy-binding gs://board-games-list --member="serviceAccount:storage-file-editor@zinovik-project.iam.gserviceaccount.com" --role="roles/storage.admin"
```

### add secrets

```bash
printf "NEXTAUTH_SECRET" | gcloud secrets create storage-file-editor-nextauth-secret --locations=europe-central2 --replication-policy="user-managed" --data-file=-

printf "GOOGLE_CLIENT_SECRET" | gcloud secrets create storage-file-editor-google-client-secret --locations=europe-central2 --replication-policy="user-managed" --data-file=-
```
