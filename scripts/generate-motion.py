"""Original procedural motion clips. Requires Python + NumPy and FFmpeg (FFMPEG_PATH)."""
import os, shutil, subprocess, math
from pathlib import Path
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
FFMPEG=os.environ.get('FFMPEG_PATH') or shutil.which('ffmpeg') or str(ROOT/'node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg')
OUT=ROOT/'public/motion'; OUT.mkdir(parents=True,exist_ok=True)
W,H,FPS,FRAMES=720,540,24,96
rng=np.random.default_rng(408)
noise=rng.uniform(0,3,(H,W,1))

def rotate(p,a,b=.15):
    cy,sy=np.cos(a),np.sin(a); cx,sx=np.cos(b),np.sin(b)
    r=p.copy(); r[:,0]=p[:,0]*cy+p[:,2]*sy;r[:,2]=-p[:,0]*sy+p[:,2]*cy
    y=r[:,1].copy();r[:,1]=y*cx-r[:,2]*sx;r[:,2]=y*sx+r[:,2]*cx
    return r

def raster(p,light,color=(1,1,1),scale=110):
    image=np.zeros((H,W,3),dtype=np.float32)+noise
    perspective=6/(6-p[:,2])
    x=np.rint(W/2+p[:,0]*perspective*scale).astype(int)
    y=np.rint(H/2-p[:,1]*perspective*scale).astype(int)
    v=np.clip(light*(.65+.35*perspective),10,245)
    good=(x>2)&(x<W-3)&(y>2)&(y<H-3)
    x,y,v=x[good],y[good],v[good]
    for dx,dy,amount in [(0,0,1),(1,0,.23),(-1,0,.23),(0,1,.23),(0,-1,.23)]:
        for c,factor in enumerate(color):np.maximum.at(image[:,:,c],(y+dy,x+dx),v*amount*factor)
    return np.clip(image,0,255).astype(np.uint8)

# Fixed seeds make each animation reproducible and keep particle identity coherent.
u=rng.uniform(0,2*np.pi,16000); v=rng.uniform(-1,1,16000)
base_sphere=np.stack([np.sqrt(1-v*v)*np.cos(u),v,np.sqrt(1-v*v)*np.sin(u)],axis=1)
grid=np.linspace(-1.3,1.3,75); g1,g2=np.meshgrid(grid,grid)
cube=np.concatenate([np.stack([np.full(g1.size,sign*1.3),g1.ravel(),g2.ravel()],axis=1)[:,order] for sign in [-1,1] for order in [(0,1,2),(1,0,2),(2,1,0)]])
phi=rng.uniform(0,2*np.pi,16000); theta=rng.uniform(0,2*np.pi,16000)
wave_x,wave_z=np.meshgrid(np.linspace(-3.8,3.8,165),np.linspace(-2.4,2.4,85))
spiral_a=rng.uniform(0,2*np.pi,20000); spiral_r=np.sqrt(rng.uniform(.06,1,20000))*3.3
portrait=base_sphere.copy()*[1.13,1.65,.91]
front=portrait[:,2]>0
# Sculpt a brow, nose, cheeks and chin into a neutral generative bust.
portrait[:,2]+=front*(.45*np.exp(-(portrait[:,0]/.22)**2-((portrait[:,1]-.05)/.5)**2)+.1*np.exp(-((portrait[:,1]+.65)/.16)**2))
eyes=((np.abs(portrait[:,0])-.42)/.25)**2+((portrait[:,1]-.36)/.14)**2<1
portrait=portrait[~(eyes&front)]
trail=rng.uniform(0,1,(6500,3));trail[:,0]=-1-trail[:,0]*3.6;trail[:,1]=(trail[:,1]-.5)*4;trail[:,2]=(trail[:,2]-.5)*1.5

letters={'I':['111','010','010','010','111'],'B':['110','101','110','101','110']}
blocks=[]
for k,char in enumerate('IB'):
    for row,line in enumerate(letters[char]):
        for col,bit in enumerate(line):
            if bit=='1':
                block=rng.uniform(-.18,.18,(420,3))+[(k*4+col-3)*.43,(2-row)*.43,0]
                blocks.append(block)
boot=np.concatenate(blocks)

def frame(name,t):
    a=t*2*np.pi
    color=(1,1,1); scale=110
    if name=='sculpture':
        p=cube.copy();p+=.13*np.sin(p[:,[1,2,0]]*6+a);p=rotate(p,a,.28+.15*np.sin(a));light=70+140*(p[:,2]+2)/4
    elif name=='red':
        p=rotate(cube,a,.35);light=75+130*(p[:,2]+2)/4;color=(1,.14,.18);scale=103
    elif name=='orbit':
        r=1.6+.42*np.cos(3*phi+a)
        p=np.stack([(r+.24*np.cos(theta))*np.cos(2*phi),(r+.24*np.cos(theta))*np.sin(2*phi),.75*np.sin(3*phi+a)+.24*np.sin(theta)],axis=1)
        p=rotate(p,.5*np.sin(a),.45);light=70+160*(np.sin(theta)+1)/2
    elif name=='rings':
        r=1.2+.14*np.sin(phi*10+a)
        p=np.stack([(r+.18*np.cos(theta))*np.cos(phi),(r+.18*np.cos(theta))*np.sin(phi),.18*np.sin(theta)],axis=1)
        p=np.concatenate([rotate(p,a,.6)+[-.65,0,0],rotate(p,-a,-.6)+[.65,0,0]])
        light=np.full(len(p),150.);scale=105
    elif name=='wave':
        x,z=wave_x.ravel(),wave_z.ravel()
        y=.32*np.sin(x*2+a)+.24*np.cos(z*3-a)+.2*np.sin((x+z)*2+a)
        p=rotate(np.stack([x,y,z],axis=1),.15,.8)
        light=80+115*(y+.8)/1.6;scale=105
    elif name=='vortex':
        ang=spiral_a+a+.8*np.sin(a+spiral_r)
        x=np.cos(ang)*spiral_r;y=np.sin(ang)*spiral_r
        z=-1.9*np.exp(-spiral_r*.9)+.10*np.sin(ang*8+a)
        p=rotate(np.stack([x,y,z],axis=1),0,.65)
        light=65+150*(spiral_r/3.3);scale=94
    elif name=='portrait':
        face=rotate(portrait,.3+.22*np.sin(a),0)
        face[:,0]+=.8
        stream=trail.copy();stream[:,1]+=.16*np.sin(stream[:,0]*2+a);stream[:,0]+=.12*np.sin(a)
        p=np.concatenate([face,stream])
        face_light=65+170*np.clip(face[:,2]+.4,0,1)
        light=np.concatenate([face_light,40+145*(stream[:,0]+4.6)/4.6]);scale=125
    else:
        p=rotate(boot,.25*np.sin(a),.08*np.cos(a));light=np.full(len(p),175.);scale=120
    image=raster(p,light,color,scale)
    if name=='boot':
        x0,x1=180,540;y0=432
        image[y0:y0+1,x0:x1]=60;image[y0+15:y0+16,x0:x1]=60;image[y0:y0+16,x0:x0+1]=60;image[y0:y0+16,x1:x1+1]=60
        length=int((.5-.5*np.cos(a))*(x1-x0-8));image[y0+4:y0+12,x0+4:x0+4+length]=165
    return image

for name in ['sculpture','orbit','boot','wave','rings','portrait','vortex','red']:
    command=[FFMPEG,'-hide_banner','-loglevel','error','-y','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-vf','scale=576:432,fps=20','-c:v','libx264','-preset','fast','-crf','29','-pix_fmt','yuv420p','-movflags','+faststart',str(OUT/f'{name}.mp4')]
    process=subprocess.Popen(command,stdin=subprocess.PIPE)
    for i in range(FRAMES):process.stdin.write(frame(name,i/FRAMES).tobytes())
    process.stdin.close()
    if process.wait()!=0:raise RuntimeError(name+' encoding failed')
    subprocess.run([FFMPEG,'-hide_banner','-loglevel','error','-y','-i',str(OUT/f'{name}.mp4'),'-frames:v','1','-q:v','3',str(OUT/f'{name}.jpg')],check=True)
    print(name,round((OUT/f'{name}.mp4').stat().st_size/1024),'KB',flush=True)
