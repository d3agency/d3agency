"""Create the studio's original ASCII architecture illustration."""
import html, math, random
random.seed(3)
W,H=280,76
grid=[[' ']*W for _ in range(H)]
def put(x,y,c):
    if 0<=x<W and 0<=y<H:grid[y][x]=c

def rect(x,y,w,h):
    for yy in range(y,y+h):
        for xx in range(x,x+w):
            put(xx,yy,random.choice('=--:.' if yy%3==0 else ':.|: '))

def line(x,y,w,c='='):
    for xx in range(x,x+w):put(xx,y,c)

def arch(x,y,w,h):
    for yy in range(h):
        for xx in range(w):
            if yy>w/2 or ((xx-w/2)/(w/2))**2+((yy-w/2)/(w/2))**2<1:put(x+xx,y+yy,' ')
    for yy in range(h):put(x,y+yy,'|');put(x+w-1,y+yy,':')

def dome(x,y,w,h):
    rect(x,y+h,w,18)
    for yy in range(h):
        half=int(w/2*math.sqrt(max(0,1-((h-yy)/h)**2)))
        for xx in range(int(x+w/2)-half,int(x+w/2)+half):put(xx,y+yy,random.choice('==--:.' if yy%2==0 else '.:| '))
    for yy in (y+h,y+h+2,y+h+17):line(x-2,yy,w+4)
    for xx in range(x+3,x+w-4,7):arch(xx,y+h+5,4,10)
    rect(x+w//2-1,y-6,2,6);line(x+w//2-3,y-1,6)
    for i in range(4):line(x-3-i*2,y+h+18+i*2,w+6+i*4)

# Atmospheric hillside and the low, scattered city.
for y in range(47,H):
    for x in range(W):
        hill=51+int(5*math.sin(x*.045)+3*math.cos(x*.11))
        if y>hill:put(x,y,random.choice(' _-..,:= '))
for x,y,w,h in [(0,40,22,28),(20,50,28,17),(48,44,25,22),(86,49,28,20),(114,52,20,18),(142,43,21,26),(176,47,27,23),(200,40,19,31),(250,43,30,28)]:
    rect(x,y,w,h);line(x-2,y-1,w+4);line(x-1,y+2,w+2)
    for xx in range(x+3,x+w-2,6):arch(xx,y+5,3,8)
dome(52,23,36,16)
dome(171,19,31,15)
dome(11,34,19,10)
# An arcade, a campanile, and a weathered classical portico.
rect(98,43,53,13)
for x in range(102,145,9):arch(x,45,6,10)
line(95,42,59);line(95,57,59)
rect(130,22,9,35)
for y in (22,26,32,40,48,55):line(128,y,13)
arch(132,28,5,9)
for y in range(8,22):
    width=max(1,int((y-7)*.7));line(134-width//2,y,width,':')
for x in (223,235,247):
    rect(x,20,5,38);line(x-2,19,9);line(x-1,55,7)
rect(219,13,37,6)
for yy in range(9):line(219+yy*2,12-yy,37-yy*4, '_')
for i in range(5):line(215-i*2,58+i*2,44+i*4)
# Footpaths and little points of light in the sky.
for y in range(61,H):
    for x in range(116-(y-61)*2,126+(y-61)*2):put(x,y,random.choice(' ._ '))
for x,y in ((37,14),(106,18),(155,7),(214,31),(262,22)):
    put(x,y,'+');put(x-1,y,'.');put(x+1,y,'.')
rows='\n'.join('<text x="0" y="%s">%s</text>'%(i*9+9,html.escape(''.join(row))) for i,row in enumerate(grid))
svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1680 684"><g fill="#55566a" font-family="monospace" font-size="10" xml:space="preserve">'+rows+'</g></svg>'
open('public/landscape.svg','w').write(svg)
