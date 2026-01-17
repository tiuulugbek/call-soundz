# GitHub'ga Push Qilish Qo'llanmasi

Loyiha GitHub repozitoriyaga push qilish uchun quyidagi usullardan birini tanlang.

## Usul 1: Personal Access Token (Tavsiya etiladi)

### 1. GitHub Personal Access Token yaratish

1. GitHub ga kiring: https://github.com
2. Settings > Developer settings > Personal access tokens > Tokens (classic)
3. "Generate new token (classic)" ni bosing
4. Token nomi: `call-soundz-push`
5. Quyidagi huquqlarni tanlang:
   - `repo` (Full control of private repositories)
6. "Generate token" ni bosing
7. Token ni ko'chirib oling (faqat bir marta ko'rsatiladi!)

### 2. Token bilan push qilish

```bash
cd /root/pbx-system

# Remote URL ni token bilan o'zgartirish
git remote set-url origin https://YOUR_TOKEN@github.com/tiuulugbek/call-soundz.git

# Push qilish
git push -u origin main
```

Yoki bir martalik:

```bash
git push -u https://YOUR_TOKEN@github.com/tiuulugbek/call-soundz.git main
```

## Usul 2: SSH Key

### 1. SSH key yaratish (agar yo'q bo'lsa)

```bash
# SSH key yaratish
ssh-keygen -t ed25519 -C "your_email@example.com"

# Key ni ko'rsatish (public key)
cat ~/.ssh/id_ed25519.pub
```

### 2. GitHub ga SSH key qo'shish

1. GitHub ga kiring: https://github.com
2. Settings > SSH and GPG keys
3. "New SSH key" ni bosing
4. Title: `call-soundz-server`
5. Key: `~/.ssh/id_ed25519.pub` faylidan ko'chirib qo'ying
6. "Add SSH key" ni bosing

### 3. SSH remote bilan push qilish

```bash
cd /root/pbx-system

# Remote URL ni SSH ga o'zgartirish
git remote set-url origin git@github.com:tiuulugbek/call-soundz.git

# GitHub host key ni qo'shish
ssh-keyscan github.com >> ~/.ssh/known_hosts

# Push qilish
git push -u origin main
```

## Usul 3: GitHub CLI

### 1. GitHub CLI o'rnatish

```bash
# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Login
gh auth login
```

### 2. Push qilish

```bash
cd /root/pbx-system
git push -u origin main
```

## Tekshirish

Push muvaffaqiyatli bo'lgandan keyin:

```bash
# Remote status
git remote -v

# Branch status
git branch -a

# GitHub da repozitoriyani tekshirish
# https://github.com/tiuulugbek/call-soundz
```

## Muammolarni hal qilish

### Authentication failed

- Token yoki SSH key to'g'ri sozlanganligini tekshiring
- GitHub da repozitoriya mavjudligini tekshiring
- Repozitoriya huquqlarini tekshiring

### Permission denied

- GitHub da repozitoriyaga yozish huquqi borligini tekshiring
- Token yoki SSH key to'g'ri sozlanganligini tekshiring

### Repository not found

- Repozitoriya URL to'g'ri ekanligini tekshiring
- Repozitoriya mavjudligini tekshiring: https://github.com/tiuulugbek/call-soundz

## Keyingi qadamlar

Push muvaffaqiyatli bo'lgandan keyin:

1. GitHub da repozitoriyani tekshiring
2. Lokal o'rnatish uchun [LOCAL_INSTALLATION.md](LOCAL_INSTALLATION.md) ni o'qing
3. Loyihani lokalda klon qilib sinab ko'ring:

```bash
cd /tmp
git clone https://github.com/tiuulugbek/call-soundz.git test-install
cd test-install
# LOCAL_INSTALLATION.md dagi ko'rsatmalarni bajaring
```
