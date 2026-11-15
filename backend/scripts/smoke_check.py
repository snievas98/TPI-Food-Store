"""Prueba de humo manual automatizada para ambiente LOCAL con seed ejecutado.

Desde backend/ con el servidor levantado en otra terminal:
python scripts/smoke_check.py

ADVERTENCIA: crea dos usuarios y pedidos cancelados de prueba en la base local.
No ejecutar en un servidor productivo.
"""
import json
import sys
import time
from http.cookiejar import CookieJar
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import HTTPCookieProcessor, Request, build_opener

BASE = 'http://localhost:8000/api/v1'


def client():
    return build_opener(HTTPCookieProcessor(CookieJar()))


def call(opener, method: str, route: str, data=None, form=False, expected=200):
    body = None
    headers = {}
    if data is not None:
        if form:
            body = urlencode(data).encode()
            headers['Content-Type'] = 'application/x-www-form-urlencoded'
        else:
            body = json.dumps(data).encode()
            headers['Content-Type'] = 'application/json'
    request = Request(BASE + route, data=body, method=method, headers=headers)
    try:
        with opener.open(request, timeout=12) as response:
            code = response.status
            text = response.read().decode()
    except HTTPError as error:
        code = error.code
        text = error.read().decode()
    if code != expected:
        raise AssertionError(f'{method} {route}: esperado HTTP {expected}, obtenido {code}\n{text}')
    return json.loads(text) if text else None


def main():
    stamp = str(int(time.time()))
    admin = client()
    user = client()
    other = client()
    print('1. Login administrador...')
    call(admin, 'POST', '/auth/token', {'username': 'admin', 'password': 'Admin1234!'}, form=True)
    assert call(admin, 'GET', '/auth/me')['role'] == 'admin'

    print('2. Registro de dos clientes y control de acceso...')
    for opener, suffix in [(user, 'a'), (other, 'b')]:
        username = f'check_{stamp}_{suffix}'
        call(opener, 'POST', '/auth/register', {
            'username': username, 'full_name': 'Cliente de prueba',
            'email': f'{username}@example.org', 'password': 'Test12345!'
        }, expected=201)
        call(opener, 'POST', '/auth/token', {'username': username, 'password': 'Test12345!'}, form=True)
    call(user, 'GET', '/admin/usuarios', expected=403)

    print('3. Catálogo y stock inicial...')
    page = call(user, 'GET', '/productos?limit=100')
    assert page['total'] >= 8
    product = next(p for p in page['items'] if p['stock'] >= 2 and p['disponible'])
    before = product['stock']
    order_input = {
        'items': [{'producto_id': product['id'], 'cantidad': 2}],
        'forma_pago': 'EFECTIVO', 'direccion_entrega': 'Avenida de prueba 1234', 'notas': 'Pedido de humo'
    }

    print('4. Pedido y descuento transaccional...')
    pedido = call(user, 'POST', '/pedidos', order_input, expected=201)
    assert pedido['estado'] == 'PENDIENTE'
    assert pedido['items'][0]['nombre_producto'] == product['nombre']
    assert pedido['total'] == round(product['precio_base'] * 2, 2)
    assert call(admin, 'GET', f"/productos/{product['id']}")['stock'] == before - 2
    call(other, 'GET', f"/pedidos/{pedido['id']}", expected=403)

    print('5. Cancelación propia y restitución íntegra...')
    cancelled = call(user, 'PATCH', f"/pedidos/{pedido['id']}/cancelar")
    assert cancelled['estado'] == 'CANCELADO'
    assert call(admin, 'GET', f"/productos/{product['id']}")['stock'] == before
    call(user, 'PATCH', f"/pedidos/{pedido['id']}/cancelar", expected=400)

    print('6. Error por producto duplicado y rollback...')
    repeated = {**order_input, 'items': [order_input['items'][0], order_input['items'][0]]}
    call(user, 'POST', '/pedidos', repeated, expected=400)
    assert call(admin, 'GET', f"/productos/{product['id']}")['stock'] == before

    print('7. Máquina de estados y terminalidad...')
    second = call(user, 'POST', '/pedidos', order_input, expected=201)
    call(admin, 'PATCH', f"/pedidos/{second['id']}/estado", {'estado': 'EN_PREPARACION'})
    call(user, 'PATCH', f"/pedidos/{second['id']}/cancelar", expected=400)
    call(admin, 'PATCH', f"/pedidos/{second['id']}/estado", {'estado': 'ENTREGADO'})
    call(admin, 'PATCH', f"/pedidos/{second['id']}/estado", {'estado': 'CANCELADO'}, expected=400)
    assert call(admin, 'GET', '/pedidos/resumen')['entregados'] >= 1
    print('OK: registro, cookies, roles, catálogo, stock, rollback, cancelación y estados.')
    print('Se conservaron dos pedidos de prueba y usuarios locales para evidencia.')


if __name__ == '__main__':
    try:
        main()
    except (AssertionError, OSError, ValueError) as exc:
        print(f'ERROR: {exc}', file=sys.stderr)
        sys.exit(1)
