#!/usr/bin/env python3
"""Generate exactly one horizontally packed transparent triptych for each sprite family.
No per-state images: runtime UVs crop panel 0/1/2 of one PNG per object.
"""
from pathlib import Path
import cairosvg
ROOT=Path(__file__).parent/'assets'
ROOT.mkdir(exist_ok=True)
HEAD='''<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="780" viewBox="0 0 1800 780"><defs>
<radialGradient id="mane"><stop stop-color="#f8dfa0"/><stop offset=".56" stop-color="#c78c46"/><stop offset="1" stop-color="#724b34"/></radialGradient>
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff0b9"/><stop offset=".48" stop-color="#c99458"/><stop offset="1" stop-color="#745036"/></linearGradient>
<linearGradient id="tash" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#77788b"/><stop offset=".46" stop-color="#44445b"/><stop offset="1" stop-color="#191b30"/></linearGradient>
<linearGradient id="beak"><stop stop-color="#c2b6a3"/><stop offset="1" stop-color="#686374"/></linearGradient>
<radialGradient id="aura"><stop stop-color="#dfd39a" stop-opacity=".44"/><stop offset="1" stop-color="#dccd9e" stop-opacity="0"/></radialGradient>
<radialGradient id="violet"><stop stop-color="#9b91b9" stop-opacity=".4"/><stop offset="1" stop-color="#9b91b9" stop-opacity="0"/></radialGradient>
</defs>'''

def lion(i):
    # A single anatomical design in three acting poses, not three independently loaded textures.
    head_shift=[(0,0),(10,26),(-10,-13)][i]
    hx,hy=head_shift
    eye=['#f8e8af','#f1c16c','#f2f0d8'][i]
    mane_pts=[]
    import math
    for n in range(44):
        a=n*2*math.pi/44
        r=125+(19 if n%3==0 else -9 if n%4==0 else 5)
        mane_pts.append(f'{255+hx+r*math.cos(a):.1f},{276+hy+r*math.sin(a):.1f}')
    mane=' '.join(mane_pts)
    # Pose changes: lifted face / guarded / bowed.
    mouth = ['M213 318 Q247 342 284 310','M220 331 Q248 330 268 333','M209 327 Q238 356 275 326'][i]
    aura='#eacb94' if i!=1 else '#e8b76e'
    return f'''<g transform="translate({i*600} 0)">
<ellipse cx="298" cy="346" rx="235" ry="306" fill="url(#aura)" opacity=".67"/>
<ellipse cx="312" cy="681" rx="155" ry="22" fill="#ad947f" opacity=".16"/>
<!-- tail, heavy hips and body -->
<path d="M420 488 Q534 502 507 390 Q493 356 515 325" fill="none" stroke="#856043" stroke-width="26" stroke-linecap="round"/>
<path d="M502 313 Q545 291 524 365 L494 338 Q470 318 502 313" fill="#785234"/>
<path d="M202 393 Q281 335 417 405 Q490 464 445 532 Q398 560 274 533 L196 487Z" fill="url(#gold)" stroke="#5c4637" stroke-width="6"/>
<path d="M292 508 Q285 581 279 653 L255 661 Q244 632 246 564 L245 501Z" fill="#8c6643" stroke="#5c493a" stroke-width="6"/>
<path d="M405 509 Q411 594 395 650 L363 661 Q367 575 357 519Z" fill="#bb8852" stroke="#5c493a" stroke-width="6"/>
<path d="M179 457 L181 648 Q154 664 137 647 L131 495Z" fill="#b17e51" stroke="#654a35" stroke-width="6"/>
<path d="M225 467 L239 644 Q222 673 188 653 L178 472Z" fill="#e4b47c" stroke="#6d513a" stroke-width="6"/>
<g fill="#b68b62" stroke="#674831" stroke-width="4"><ellipse cx="154" cy="658" rx="40" ry="17"/><ellipse cx="212" cy="658" rx="42" ry="17"/><ellipse cx="267" cy="658" rx="31" ry="14"/><ellipse cx="374" cy="658" rx="34" ry="14"/></g>
<!-- mane starburst and sweeping curls -->
<polygon points="{mane}" fill="url(#mane)" stroke="#6f4932" stroke-width="7" stroke-linejoin="round"/>
<ellipse cx="{255+hx}" cy="{277+hy}" rx="108" ry="112" fill="url(#mane)" opacity=".8"/>
<g opacity=".76" fill="none" stroke="#fae0a6" stroke-linecap="round" stroke-width="5"><path d="M164 260 Q162 337 194 369"/><path d="M199 179 Q177 236 195 271"/><path d="M329 190 Q353 264 319 326"/><path d="M311 366 Q291 411 251 420"/></g>
<!-- ears and asymmetric feline face -->
<path d="M{177+hx} {219+hy} Q{171+hx} {170+hy} {203+hx} {180+hy} L{218+hx} {217+hy}Z" fill="#e3b27c" stroke="#714831" stroke-width="7"/>
<path d="M{313+hx} {215+hy} Q{338+hx} {163+hy} {350+hx} {204+hy} L{337+hx} {239+hy}Z" fill="#e0a46b" stroke="#714831" stroke-width="7"/>
<path d="M{209+hx} {204+hy} Q{254+hx} {179+hy} {316+hx} {210+hy} Q{335+hx} {285+hy} {293+hx} {326+hy} L{269+hx} {353+hy} Q{246+hx} {358+hy} {216+hx} {326+hy} Q{185+hx} {282+hy} {209+hx} {204+hy}Z" fill="#f1c995" stroke="#694b39" stroke-width="6"/>
<path d="M{207+hx} {260+hy} Q{227+hx} {249+hy} {246+hx} {263+hy} M{279+hx} {264+hy} Q{300+hx} {247+hy} {318+hx} {258+hy}" fill="none" stroke="#6d4935" stroke-width="10" stroke-linecap="round"/>
<g fill="{eye}"><ellipse cx="{227+hx}" cy="{265+hy}" rx="6" ry="8"/><ellipse cx="{297+hx}" cy="{264+hy}" rx="6" ry="8"/></g>
<path d="M{232+hx} {298+hy} Q{263+hx} {284+hy} {291+hx} {298+hy} L{266+hx} {312+hy} L{253+hx} {312+hy}Z" fill="#5c4035"/>
<path d="{mouth}" fill="none" stroke="#604537" stroke-width="5" stroke-linecap="round" transform="translate({hx} {hy})"/>
<g stroke="#f1d8ab" opacity=".63" stroke-width="3"><path d="M235 317 l-83 -15 M236 323 l-83 16 M287 317 l70 -22 M286 323 l74 16" transform="translate({hx} {hy})"/></g>
<!-- attitude-specific literary rays -->
{['<path d="M150 126 l-25 -49 M255 119 l0 -57 M358 137 l29 -45" stroke="#f1d597" stroke-width="8" opacity=".8"/>','<path d="M134 363 l-58 15 M374 328 l54 -24" stroke="#dbab6c" stroke-width="7" opacity=".73"/>','<path d="M147 171 Q122 142 109 96 M370 166 Q391 121 400 91" stroke="#e9e0c4" stroke-width="7" fill="none" opacity=".7"/>'][i]}
</g>'''

def tash_sprite(i):
    arch=['#80719c','#a2a1b9','#d4c2b0'][i]
    wing=['M255 284 Q172 235 83 310 Q159 303 188 373','M255 285 Q139 156 64 218 Q163 251 194 359','M260 285 Q154 268 108 349 Q173 337 202 385'][i]
    eye=['#e5aeb1','#ffbeb1','#ddded8'][i]
    return f'''<g transform="translate({i*600} 0)">
<ellipse cx="301" cy="339" rx="228" ry="304" fill="url(#violet)" opacity=".78"/>
<ellipse cx="302" cy="682" rx="128" ry="19" fill="#998fba" opacity=".15"/>
<!-- skeletal legs, talons -->
<path d="M269 501 Q252 590 225 668 M320 502 Q326 601 362 662" stroke="#8c8795" stroke-width="23" fill="none" stroke-linecap="round"/>
<g stroke="#b6adb7" stroke-width="9" stroke-linecap="round"><path d="M224 664 l-44 11 M224 664 l5 20 M224 664 l30 17 M359 664 l-19 21 M360 666 l22 13 M360 668 l45 -1"/></g>
<!-- ethereal black cloak -->
<path d="M271 278 Q205 353 182 468 Q160 542 159 590 Q231 573 267 617 Q292 559 313 615 Q378 575 444 597 Q396 432 334 286Z" fill="url(#tash)" stroke="#a69fb3" stroke-width="5"/>
<path d="M285 349 Q265 460 271 583" stroke="#a5a5b8" opacity=".47" stroke-width="5" fill="none"/>
<!-- upper wing arms 1 and 2 -->
<path d="{wing}" stroke="#666478" stroke-width="26" fill="none" stroke-linecap="round"/>
<path d="M335 282 Q421 214 510 310 Q446 301 399 389" stroke="#727186" stroke-width="26" fill="none" stroke-linecap="round"/>
<!-- lower arms 3 and 4; joints, grasping hands -->
<path d="M245 374 Q178 408 156 497 M358 370 Q424 406 444 503" stroke="#868093" stroke-width="18" fill="none" stroke-linecap="round"/>
<g stroke="#c4b9c2" stroke-width="6" fill="none" stroke-linecap="round"><path d="M156 495 l-29 21 m29 -21 l-4 34 m4 -34 l24 17 M446 502 l28 24 m-28 -24 l5 35 m-5 -35 l-31 17 M90 311 l-23 17 M505 310 l28 24"/></g>
<!-- feathers etched into arms -->
<path d="M103 310 q64 0 97 39 M407 366 q62 -71 101 -55" stroke="{arch}" opacity=".7" stroke-width="8" fill="none"/>
<!-- torso ornament and spine -->
<path d="M287 336 L300 365 L320 338 M282 393 L305 426 L324 394 M268 454 L305 490 L341 452" stroke="#d7c9b5" opacity=".47" stroke-width="5" fill="none"/>
<!-- long bird neck, skull, hooked beak -->
<path d="M269 286 Q265 228 248 179 Q239 136 267 122 Q322 98 340 141 Q356 177 320 220 L326 290Z" fill="url(#tash)" stroke="#b3a9b9" stroke-width="6"/>
<path d="M260 135 Q281 99 320 125 Q350 147 335 181 Q328 203 299 215 L337 227 Q368 231 362 250 Q336 257 301 235 L270 221 Q249 205 252 172Z" fill="url(#beak)" stroke="#696476" stroke-width="5"/>
<path d="M327 213 Q367 222 363 248 Q350 255 340 244" fill="#79717a"/>
<ellipse cx="304" cy="158" rx="12" ry="8" fill="{eye}"/><circle cx="306" cy="159" r="3" fill="#332638"/>
<path d="M263 128 Q258 91 283 69 M294 120 Q308 88 327 72" stroke="{arch}" stroke-width="9" fill="none"/>
<!-- attitude-specific glyph orbit -->
{['<path d="M198 131 L176 96 L154 130 M386 132 L416 100 L442 139" stroke="#9c87b1" stroke-width="7" fill="none" opacity=".75"/>','<path d="M123 172 L84 122 M446 169 L489 113" stroke="#baa1bf" stroke-width="8" opacity=".7"/>','<circle cx="301" cy="163" r="100" fill="none" stroke="#bcb3c1" stroke-dasharray="8 17" stroke-width="4" opacity=".6"/>'][i]}
</g>'''

for name,draw in [('aslan',lion),('tash',tash_sprite)]:
    svg=HEAD+''.join(draw(i) for i in range(3))+'</svg>'
    (ROOT/f'{name}_triptych.svg').write_text(svg)
    cairosvg.svg2png(bytestring=svg.encode(),write_to=str(ROOT/f'{name}_triptych.png'),output_width=1350,output_height=585)
    print(name,(ROOT/f'{name}_triptych.png').stat().st_size)
