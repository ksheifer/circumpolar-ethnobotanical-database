#!/usr/bin/env python3
"""Optional real-browser smoke test. Requires playwright and Chromium, run with python scripts/smoke_browser.py."""
import http.server
import socketserver
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs): super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args): pass
class Server(socketserver.ThreadingTCPServer): allow_reuse_address=True

with Server(('127.0.0.1',0),QuietHandler) as server:
    threading.Thread(target=server.serve_forever,daemon=True).start()
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        page=browser.new_page()
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.route('https://**/*',lambda route:route.abort())
        page.goto(f'http://127.0.0.1:{server.server_address[1]}/',wait_until='domcontentloaded')
        page.get_by_role('navigation',name='Sections').get_by_role('button',name='Languages').click()
        for language,n in [('Enets',3),('Nganasan',2),('Forest Yukaghir',24),('Tundra Yukaghir',8),('Tundra Nenets',73),('Komi',110)]:
            page.locator('#languageFilter').select_option(label=language)
            actual=page.locator('table.index tbody tr').count()
            assert actual==n,(language,actual,n)
            print('PASS browser catalogue',language,actual)
        page.locator('#languageFilter').select_option(label='Enets')
        assert page.locator('#varietyFilter option').count()==3
        page.locator('#varietyFilter').select_option('enets-forest')
        assert page.locator('table.index tbody tr').count()==2
        page.locator('#varietyFilter').select_option('enets-tundra')
        assert page.locator('table.index tbody tr').count()==1
        page.locator('#languageFilter').select_option(label='Forest Yukaghir')
        page.locator('button[data-profile]').first.click()
        assert page.locator('main').get_by_text('Нелемное').count()==0  # EN interface
        assert page.locator('main').get_by_text('Nelemnoe').count() >= 1
        page.locator('header button[data-lang="ru"]').click()
        assert page.locator('main').get_by_text('Нелемное').count() >= 1
        page.locator('nav#navigation button[data-view="sources"]').click()
        assert page.locator('a.resource-url[href="https://sibjournal.philology.nsc.ru/sites/default/files/2026-09/12_85.pdf"]').count()>=1
        print('PASS browser profile bilingual & source URL')
        assert not errors,errors
        browser.close()
    server.shutdown()
print('PASS browser smoke test')
