#!/usr/bin/env python3
"""
Envía el informe técnico de El Morral Digital por SMTP.

Uso (no guardes credenciales en el repo; pásalas por entorno):

    MORRAL_SMTP_HOST=smtp.gmail.com \
    MORRAL_SMTP_PORT=587 \
    MORRAL_SMTP_USER=tu@gmail.com \
    MORRAL_SMTP_PASS='app-password' \
    MORRAL_MAIL_TO='elgoldo129@protonmail.com' \
    python3 scripts/enviar-informe.py

Gmail requiere una «contraseña de aplicación» (no la contraseña normal).
Protonmail requiere Proton Bridge (SMTP local en 127.0.0.1:1025).
El cuerpo HTML se genera desde docs/INFORME-SEGURIDAD.md.
"""
import os, smtplib, ssl, sys, tempfile
from email.message import EmailMessage
from email.utils import formataddr

HOST = os.environ.get("MORRAL_SMTP_HOST", "")
PORT = int(os.environ.get("MORRAL_SMTP_PORT", "587"))
USER = os.environ.get("MORRAL_SMTP_USER", "")
PASS = os.environ.get("MORRAL_SMTP_PASS", "")
MAIL_FROM = os.environ.get("MORRAL_MAIL_FROM", USER)
MAIL_TO = os.environ.get("MORRAL_MAIL_TO", "")
SUBJECT = os.environ.get("MORRAL_MAIL_SUBJECT",
                         "Informe técnico — El Morral Digital (seguridad y correos)")

HTML_PATH = os.environ.get("MORRAL_INFORME_HTML",
                           os.path.join(tempfile.gettempdir(),
                                        "informe-email.html"))
MD_PATH = os.path.join(os.path.dirname(__file__), "..", "docs", "INFORME-SEGURIDAD.md")

if not (HOST and USER and PASS and MAIL_TO):
    sys.exit("Faltan variables: MORRAL_SMTP_HOST, MORRAL_SMTP_USER, "
             "MORRAL_SMTP_PASS, MORRAL_MAIL_TO")

try:
    html_body = open(HTML_PATH, encoding="utf-8").read()
except FileNotFoundError:
    html_body = "<pre>" + open(MD_PATH, encoding="utf-8").read() + "</pre>"

msg = EmailMessage()
msg["From"] = formataddr(("El Morral Digital", MAIL_FROM))
msg["To"] = MAIL_TO
msg["Subject"] = SUBJECT
msg.set_content("Informe técnico en HTML; si no se ve, abre la versión adjunta.")
msg.add_alternative(html_body, subtype="html")

with smtplib.SMTP(HOST, PORT, timeout=30) as s:
    s.ehlo()
    if PORT != 465:
        s.starttls(context=ssl.create_default_context())
        s.ehlo()
    s.login(USER, PASS)
    s.send_message(msg)
print(f"Enviado a {MAIL_TO} vía {HOST}:{PORT}")
