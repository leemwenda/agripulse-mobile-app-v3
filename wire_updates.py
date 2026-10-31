import pathlib
p = pathlib.Path('src/App.tsx'); s = p.read_text()
def sub(old, new):
    global s
    assert s.count(old) == 1, f"expected 1 of {old[:60]!r}, found {s.count(old)}; nothing written"
    s = s.replace(old, new)
sub("import { AppProvider, useApp } from './context/AppContext';",
    "import { AppProvider, useApp } from './context/AppContext';\nimport { UpdateGate } from './components/UpdateGate';")
sub("<BrowserRouter>\n        <AppRoutes />", "<BrowserRouter>\n        <UpdateGate />\n        <AppRoutes />")
p.write_text(s)
print("wired")
