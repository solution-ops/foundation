# 🗃️ Neon Database Branching Setup Guide

This guide walks you through setting up Neon database branching for PR feature environments in your Task.Cloud project.

## 📋 Prerequisites

- Neon account and project
- GitHub repository with admin access
- Existing CI/CD pipeline (already configured)

## 🚀 Setup Steps

### 1. Install Neon GitHub Integration

1. **Navigate to Neon Console**
   - Go to [Neon Console](https://console.neon.tech)
   - Select your project

2. **Access Integrations**
   - Navigate to the **Integrations** page in your Neon project
   - Locate the **GitHub** card and click **Add**

3. **Install GitHub App**
   - Click **Install GitHub App**
   - Select your GitHub account
   - Choose **All repositories** or **Only select repositories**
   - Select your Task.Cloud repository
   - Click **Connect**

### 2. Verify GitHub Secrets and Variables

After installation, verify these are automatically created in your GitHub repository:

**GitHub Repository Settings → Secrets and Variables → Actions:**

#### Secrets (🔐)
- `NEON_API_KEY` - Automatically generated Neon API key

#### Variables (📊)
- `NEON_PROJECT_ID` - Your Neon project ID

### 3. Environment Variables

The workflow uses these environment variables for different environments:

#### Production Environment
- `DATABASE_URL_PROD` - Production database connection string

#### Staging Environment  
- `DATABASE_URL_STAGE` - Staging database connection string

## 🔄 How It Works

### For Pull Requests

1. **Branch Creation**: When a PR is opened/reopened/synchronized:
   - Creates a new Neon database branch: `feat/pr-{branch-name}`
   - Runs database migrations on the new branch
   - Comments on the PR with branch information

2. **Database Usage**: All CI jobs use the temporary database branch:
   - Build process uses the branch database
   - Unit tests run against the branch database
   - E2E tests use the branch database
   - Deployment uses the branch database

3. **Branch Cleanup**: When PR is closed:
   - Automatically deletes the Neon database branch
   - Comments on the PR about cleanup

### For Other Branches

- **`dev` branch**: Uses `DATABASE_URL_STAGE`
- **`main` branch**: Uses `DATABASE_URL_PROD`

## 🛠️ Workflow Files

### Main Workflow
- `.github/workflows/neon-db-branch.yml` - Neon database branching workflow
- `.github/workflows/ci.yml` - Updated main CI pipeline

### Integration Points
The Neon workflow integrates with:
- Build process (`.github/workflows/build.yml`)
- Unit tests (`.github/workflows/unit-test.yml`)
- Database migrations (`.github/workflows/migrate.yml`)
- Deployment (`.github/workflows/deploy.yml`)
- E2E tests (`.github/workflows/e2e.yml`)

## 🔧 Configuration

### Branch Naming Convention
- **Format**: `feat/pr-{PR_NUMBER}-{BRANCH_NAME}`
- **Example**: `feat/pr-123-feat-user-auth`

### Database URL Priority
For PRs, the system uses this priority:
1. Neon branch database URL (if available)

### Concurrency Control
- Uses GitHub's concurrency groups to prevent conflicts
- Cancels in-progress runs when new changes are pushed

## 🧪 Testing the Integration

### 1. Create a Test PR
```bash
git checkout -b test-neon-integration
git commit --allow-empty -m "Test Neon database branching"
git push origin test-neon-integration
```

### 2. Open a Pull Request
- Create a PR from your test branch
- Check the GitHub Actions tab for the workflow run
- Verify the Neon branch is created
- Check the PR comments for database branch information

### 3. Verify Database Branch
- Check your Neon Console for the new branch
- Verify migrations ran successfully
- Test your application with the branch database

### 4. Cleanup Test
- Close the PR
- Verify the Neon branch is automatically deleted
- Check PR comments for cleanup confirmation

## 🚨 Troubleshooting

### Common Issues

#### 1. Missing Neon API Key
**Error**: `NEON_API_KEY secret not found`
**Solution**: 
- Verify GitHub integration is properly installed
- Check repository secrets in GitHub Settings

#### 2. Missing Project ID
**Error**: `NEON_PROJECT_ID variable not found`
**Solution**:
- Verify GitHub integration is properly installed
- Check repository variables in GitHub Settings

#### 3. Database Migration Failures
**Error**: Migration commands fail
**Solution**:
- Check database connection
- Verify migration files are present
- Check database permissions

#### 4. Branch Creation Failures
**Error**: Neon branch creation fails
**Solution**:
- Verify Neon API key has correct permissions
- Check Neon project limits and quotas
- Verify branch naming doesn't conflict

### Debug Steps

1. **Check Workflow Logs**
   - Go to GitHub Actions tab
   - Click on the failed workflow run
   - Review step-by-step logs

2. **Verify Secrets and Variables**
   - Repository Settings → Secrets and Variables → Actions
   - Ensure `NEON_API_KEY` and `NEON_PROJECT_ID` are present

3. **Test Neon API Access**
   ```bash
   # Test API key manually
   curl -H "Authorization: Bearer $NEON_API_KEY" \
        https://console.neon.tech/api/v2/projects
   ```

4. **Check Neon Console**
   - Verify project exists and is accessible
   - Check for any project-level restrictions

## 📚 Additional Resources

- [Neon GitHub Integration Docs](https://neon.com/docs/guides/neon-github-integration)
- [Neon API Documentation](https://neon.com/docs/api-reference)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🔄 Maintenance

### Regular Tasks
- Monitor Neon branch usage and costs
- Review and clean up any orphaned branches
- Update Neon API key if needed
- Monitor workflow performance and reliability

### Cost Optimization
- Branches are automatically cleaned up on PR close
- Monitor branch creation/deletion logs
- Set up alerts for unusual branch activity

## 🆘 Support

If you encounter issues:

1. **Check the logs** in GitHub Actions
2. **Verify configuration** using this guide
3. **Test manually** using Neon Console
4. **Contact support** if issues persist

---

**Note**: This integration provides isolated database environments for each PR, enabling safe testing of database changes without affecting production or staging environments.
