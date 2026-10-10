FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

# Install system dependencies (C++ compilers for numpy/sklearn, PostgreSQL, sudo)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ curl postgresql postgresql-contrib sudo && \
    rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces standard: non-root user with UID 1000
RUN useradd -m -u 1000 user && \
    echo "user ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

WORKDIR /home/user/app

# Install Python requirements
COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and entrypoint
COPY backend/app ./app
COPY deploy/huggingface/entrypoint.sh entrypoint.sh

RUN chmod +x entrypoint.sh && chown -R user:user /home/user

USER user

EXPOSE 7860

CMD ["./entrypoint.sh"]

