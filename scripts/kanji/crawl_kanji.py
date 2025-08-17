from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time
import re

def crawl_kanji_kanshudo(kanji: str):
    url = f"https://www.kanshudo.com/kanji/{kanji}"
    
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    driver = webdriver.Chrome(options=options)
    
    driver.get(url)
    time.sleep(1)
    
    data = {"kanji": kanji}
    
    # --- Strokes ---
    try:
        span_strokes = driver.find_element(By.XPATH, "//span[contains(text(),'Strokes')]")
        strokes = driver.execute_script("return arguments[0].nextSibling.nodeValue", span_strokes)
        data["strokes"] = strokes.strip() if strokes else None
    except:
        data["strokes"] = None
    
    # --- JLPT ---
    try:
        jlpt = driver.find_element(By.XPATH, "//span[contains(text(),'JLPT')]/following-sibling::a").text
        data["jlpt_level"] = jlpt
    except:
        data["jlpt_level"] = None
    
    # --- On readings ---
    try:
        help_on_div = driver.find_element(By.ID, "help_on")
        parent_div = help_on_div.find_element(By.XPATH, "..")
        text = parent_div.text.replace("On", "").replace("\n", " ").strip()
        on_readings = [s.strip() for s in text.split() if s.strip()]
        data["on_readings"] = on_readings
    except:
        data["on_readings"] = []
    
    # --- Kun readings ---
    # --- Kun readings ---
    kun_readings = []
    try:
        kun_links = driver.find_elements(By.XPATH, "//div[@id='help_kun']/following-sibling::a")
        for a in kun_links:
            # Lấy toàn bộ node con
            parts = driver.execute_script("""
                let a = arguments[0];
                let res = [];
                for (let n of a.childNodes){
                    if(n.nodeType === Node.TEXT_NODE){
                        res.push(n.textContent);
                    } else if(n.nodeType === Node.ELEMENT_NODE){
                        res.push(n.textContent);
                    }
                }
                return res;
            """, a)
            # Nối với dấu chấm để phân tách
            hiragana = ".".join([p.strip() for p in parts if p.strip()])
            
            # Lấy nghĩa ngay sau thẻ <a>
            meaning = driver.execute_script("return arguments[0].nextSibling.nodeValue", a)
            if meaning:
                meaning = meaning.strip()
            kun_readings.append({"hiragana": hiragana, "meaning": meaning})
        data["kun_readings"] = kun_readings
    except:
        data["kun_readings"] = []

    
    # --- Components ---
    def parse_components_tree(div):
        # Lấy các nodes theo thứ tự childNodes với symbol ⿰⿱⿻ và <a>
        js = js = """
            let div = arguments[0];
            let res = [];
            for (let n of div.childNodes){
                if(n.nodeType === Node.TEXT_NODE){
                    let parts = n.textContent.trim().split(/\\s+/);
                    for (let p of parts){
                        if(['⿰','⿱','⿻'].includes(p)) res.push({type:'symbol', text:p});
                    }
                } else if(n.nodeType === Node.ELEMENT_NODE){
                    if(n.tagName.toLowerCase() === 'a'){
                        let prev = n.previousSibling ? n.previousSibling.textContent : '';
                        let next = n.nextSibling ? n.nextSibling.textContent : '';
                        if(!n.textContent.includes("The Kanji Map") && !(prev.includes('(') && next.includes(')'))){
                            res.push({type:'leaf', text:n.textContent.trim()});
                        }
                    }
                }
            }
            return res;
            """

        nodes = driver.execute_script(js, div)

        # Build tree chính xác theo ⿰⿱⿻ với 2 phần con mỗi symbol
        def build_tree(nodes, idx=0):
            if idx >= len(nodes):
                return [], idx
            node = nodes[idx]
            if node['type'] == 'leaf':
                return node['text'], idx + 1
            # node là symbol ⿰⿱⿻
            idx += 1
            children = []
            while len(children) < 2 and idx < len(nodes):
                child, idx = build_tree(nodes, idx)
                children.append(child)
            return {'component_symbol': node['text'], 'components': children}, idx

        tree, _ = build_tree(nodes, 0)
        return tree

    try:
        comp_div = driver.find_element(By.XPATH, "//div[div[text()='Components']]/div[@class='col-3-4']")
        components_tree = parse_components_tree(comp_div)
        top_symbol = components_tree['component_symbol'] if isinstance(components_tree, dict) else None
    except Exception as e:
        print("Error parsing components:", e)
        components_tree = []
        top_symbol = None

    data["components"] = components_tree

    
    driver.quit()
    return data

# --- Test ---
if __name__ == "__main__":
    from pprint import pprint
    kanji_info = crawl_kanji_kanshudo("生")
    pprint(kanji_info, width=150)

