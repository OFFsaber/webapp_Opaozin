@echo off
echo ========================================
echo Inicializando status dos pedidos...
echo ========================================

REM Configurações do banco de dados
set SERVER=localhost
set DATABASE=OPAOZIN
set USER=sa
set PASSWORD=123456

REM Executar script SQL de inicialização
sqlcmd -S %SERVER% -d %DATABASE% -U %USER% -P %PASSWORD% -i inicializar_status_pedidos.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Status dos pedidos inicializado com sucesso!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ERRO ao inicializar status dos pedidos!
    echo ========================================
)

pause 