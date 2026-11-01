"""Timeline-driven illustration of mechanical motion, not a physical recording."""
import math
from sfx.score_kit import airy, bed, chords
from sfx.synth import click
TIMELINE = "../mecha-frog-film/timeline.json"
TARGET_LUFS = -19.0
SEED = 126

def score(mix, tl):
    harmony=chords("Dm9:D2 F3 A3 C4 E4/D1","Bbmaj7:Bb2 D3 F3 A3/Bb1","Fmaj9:F2 A3 C4 E4 G4/F1","C6:C2 E3 G3 A3/C1")
    left,right,low,drums=bed(tl["duration"],60,harmony,kicks=(),snares=(),hats=0,keys_vel=.23)
    mix.put_stereo(0,left,right,.065)
    mix.put(0,low,.02)
    for e in tl["events"]:
        if e["at"]:
            mix.put(e["at"],click(1600,.035),.027)
        duration=e["until"]-e["at"]
        if e.get("explosion", [0,0])[1] > e.get("explosion", [0,0])[0]:
            for stage in range(4):
                mix.put(e["at"]+stage*.7,airy(.24,500,2400,.2),.025)
        if e["mode"] == "walk":
            for u in (.42,.90):
                mix.put(e["at"]+duration*u,click(420,.045),.035)
        if e["mode"] in ("walk","jump","hunt","call"):
            sr=48000
            wave=[]
            phase=0
            for i in range(round(duration*sr)):
                u=i/(duration*sr)
                p=e["from"]+(e["to"]-e["from"])*u
                edge=min(1,u*15,(1-u)*15)
                if e["mode"]=="call":
                    # Same crank phase and voice envelope as model.js.
                    amp=abs(math.sin(math.pi+math.tau*p))*.8
                    freq=115+35*(math.sin(math.pi*max(0,min(1,(p-.12)/.72)))**2)
                else:
                    amp=.2+.3*math.sin(math.pi*u)**2
                    freq=190+70*math.sin(math.pi*u)**2
                phase+=math.tau*freq/sr
                wave.append(edge*amp*(math.sin(phase)+.14*math.sin(phase*5)))
            mix.put(e["at"],wave,.035 if e["mode"]!="call" else .07)
