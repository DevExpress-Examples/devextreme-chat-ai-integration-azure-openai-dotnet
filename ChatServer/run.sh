#!/bin/bash
# Script to run the ChatServer

cd "$(dirname "$0")"
echo "Starting ChatServer on ports 5005 (HTTP) and 5006 (HTTPS)..."
dotnet run
