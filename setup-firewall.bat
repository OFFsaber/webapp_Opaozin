@echo off
echo Configurando Firewall para o Servidor Node.js...
echo.

REM Adicionar regra para porta 3000
netsh advfirewall firewall add rule name="Node.js Server Port 3000" dir=in action=allow protocol=TCP localport=3000

REM Adicionar regra para saída também
netsh advfirewall firewall add rule name="Node.js Server Port 3000 Out" dir=out action=allow protocol=TCP localport=3000

echo.
echo Regras do firewall configuradas com sucesso!
echo Agora você pode acessar o servidor em: http://192.168.1.3:3000
echo.
pause 