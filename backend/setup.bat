@echo off
echo ========================================
echo Sistema de Controle de Expedicao
echo Configuracao Inicial do Backend
echo ========================================
echo.

echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js em: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js encontrado: 
node --version
echo.

echo [2/5] Instalando dependencias...
npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias!
    pause
    exit /b 1
)
echo Dependencias instaladas com sucesso!
echo.

echo [3/5] Configurando arquivo de ambiente...
if not exist .env (
    copy env.example .env
    echo Arquivo .env criado. Por favor, edite-o com suas configuracoes.
) else (
    echo Arquivo .env ja existe.
)
echo.

echo [4/5] Verificando SQL Server...
echo Por favor, certifique-se de que:
echo - SQL Server esta rodando
echo - Base de dados 'base_aa_opaozin' foi criada
echo - Script 'scripts/create_tables.sql' foi executado
echo - Autenticacao Windows esta configurada
echo.

echo [5/5] Configuracao concluida!
echo.
echo Para iniciar o servidor, execute:
echo   npm run dev
echo.
echo Para testar a conexao com o banco:
echo   http://localhost:3000/api/test-db
echo.
echo Para verificar o status da API:
echo   http://localhost:3000/api/health
echo.

pause 