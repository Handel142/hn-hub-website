# HN HUB Website

All files are in one folder on purpose (no sub-folders), so they upload to GitHub easily.

1. Upload ALL files to the top level of your GitHub repository.
2. Netlify: Add new site, Import from GitHub, pick the repository, then Deploy. No build settings needed (netlify.toml handles it).
3. Edit your site at yourwebsite.netlify.app/admin (needs the one-time GitHub login setup).
4. The editor lives at /admin; change the "repo:" line in config.yml if your GitHub repository name differs.
