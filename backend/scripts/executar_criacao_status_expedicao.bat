@echo off
echo ========================================
echo Criando tabela STATUS_EXPEDICAO...
echo ========================================

REM Configurações do banco de dados
set SERVER=localhost
set DATABASE=OPAOZIN
set USER=sa
set PASSWORD=123456

REM Executar script SQL
sqlcmd -S %SERVER% -d %DATABASE% -U %USER% -P %PASSWORD% -i create_status_expedicao_table.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Tabela STATUS_EXPEDICAO criada com sucesso!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ERRO ao criar tabela STATUS_EXPEDICAO!
    echo ========================================
)

pause 