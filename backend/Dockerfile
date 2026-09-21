# Multi-stage build for ASP.NET Core API
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["Dormi.Domain/Dormi.Domain.csproj", "Dormi.Domain/"]
COPY ["Dormi.Application/Dormi.Application.csproj", "Dormi.Application/"]
COPY ["Dormi.Infrastructure/Dormi.Infrastructure.csproj", "Dormi.Infrastructure/"]
COPY ["Dormi.API/Dormi.API.csproj", "Dormi.API/"]

RUN dotnet restore "Dormi.API/Dormi.API.csproj"

# Copy full source and publish
COPY . .
WORKDIR "/src/Dormi.API"
RUN dotnet publish "Dormi.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

ENTRYPOINT ["dotnet", "Dormi.API.dll"]
