"""程序化合成音效：落地/弹出/风声/揭示/叮当/笔触/升调/金币/重低音/否定/闪光/心跳

纯 Python 标准库合成（wave/math/array/random），无任何外部素材 —— 自产自用，无版权顾虑。
来源：remotion-dev / 20260805-oddsum-square-3d/scripts/make_sfx.py（2026-08-07），2026-09-13 搬进本仓。

用法（在项目目录下跑，输出到 <项目>/public/audio/sfx/）：
    cp -r ../../tools/sfx .            # 或直接在 tools/sfx 下改 OUT
    python3 ../../tools/sfx/make_sfx.py

改名/调参：底部 __main__ 里 land 音高（默认 85→165Hz 逐级升）、各音效 gain 都在此处。
"""
import wave, math, array, random, os

SR = 44100
# 输出到仓库级母本库 sfx/（与 bgm/ 同规格）；项目里用 cp 取用
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "sfx")
os.makedirs(OUT, exist_ok=True)


def write_wav(name, samples):
    w = wave.open(os.path.join(OUT, name), "w")
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    data = array.array("h", (max(-32767, min(32767, int(s * 32767))) for s in samples))
    w.writeframes(data.tobytes())
    w.close()
    print(f"wrote {name} ({len(samples)/SR:.2f}s)")


def sine(freq, n, phase=0.0):
    return [math.sin(2 * math.pi * freq * i / SR + phase) for i in range(n)]


def noise(n, seed=1):
    rng = random.Random(seed)
    return [rng.uniform(-1, 1) for i in range(n)]


def lowpass(x, window=12):
    n = len(x)
    out = [0.0] * n
    acc = 0.0
    for i in range(n):
        acc += x[i]
        if i >= window:
            acc -= x[i - window]
        out[i] = acc / min(i + 1, window)
    return out


def land(freq, dur=0.45, gain=0.9):
    """立方体落地：低频 thump + 起始 click"""
    n = int(SR * dur)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        d = math.exp(-t * 16)
        out[i] += math.sin(2 * math.pi * freq * t) * d
        out[i] += 0.6 * math.sin(2 * math.pi * freq * 0.5 * t) * d
    for i in range(int(0.012 * SR)):
        out[i] += 0.45 * math.exp(-i / (0.004 * SR))
    return [x * gain for x in out]


def pop(dur=0.16, gain=0.7):
    """方程弹出：上滑短 chirp"""
    n = int(SR * dur)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        freq = 320 + 680 * (t / dur)
        out[i] = math.sin(2 * math.pi * freq * t) * math.exp(-t * 26)
    return [x * gain for x in out]


def whoosh(dur=0.7, gain=0.5):
    """旋转/开场：噪声 + 起伏包络（带一点 sweep 感）"""
    n = int(SR * dur)
    raw = noise(n, 3)
    sm = lowpass(raw, 10)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        env = math.sin(math.pi * t / dur) ** 1.6
        wob = 0.6 + 0.4 * math.sin(2 * math.pi * 2.5 * t)
        out[i] = sm[i] * env * wob
    return [x * gain for x in out]


def reveal(dur=0.95, gain=1.0):
    """主爆点：低音冲击 + 上行琶音 C5 E5 G5 C6"""
    n = int(SR * dur)
    out = [0.0] * n
    for i in range(int(0.32 * SR)):
        t = i / SR
        out[i] += math.sin(2 * math.pi * 55 * t) * math.exp(-t * 11) * 0.95
        out[i] += math.sin(2 * math.pi * 110 * t) * math.exp(-t * 18) * 0.45
    for k, note in enumerate([523, 659, 784, 1046]):
        start = int((0.12 + k * 0.11) * SR)
        for i in range(int(0.28 * SR)):
            j = start + i
            if j >= n:
                break
            t = i / SR
            out[j] += math.sin(2 * math.pi * note * t) * math.exp(-t * 9) * 0.34
    return [x * gain for x in out]


def chime(dur=0.85, gain=0.8):
    """收尾：钟声双音"""
    n = int(SR * dur)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        out[i] = (
            math.sin(2 * math.pi * 880 * t)
            + 0.4 * math.sin(2 * math.pi * 1760 * t)
            + 0.2 * math.sin(2 * math.pi * 2637 * t)
        ) * math.exp(-t * 5.5)
        if t > 0.32:
            dt = t - 0.32
            out[i] += (
                math.sin(2 * math.pi * 1320 * dt)
                + 0.3 * math.sin(2 * math.pi * 2640 * dt)
            ) * math.exp(-dt * 4.5) * 0.5
    return [x * gain for x in out]


def pop_var(f0, f1, dur=0.16, gain=0.7):
    """pop 的音高变体：同一「上滑 chirp」配方换起止频率。
    库里 pop 一种音在一条视频里要用 20+ 次，高低变体交替才不腻。"""
    n = int(SR * dur)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        freq = f0 + (f1 - f0) * (t / dur)
        out[i] = math.sin(2 * math.pi * freq * t) * math.exp(-t * 26)
    return [x * gain for x in out]


def scribe(dur=0.20, gain=0.5):
    """书写笔触：重低通噪声 + 快速起振，像马克笔划过板面（算式行/文字行写出时用）"""
    n = int(SR * dur)
    sm = lowpass(noise(n, 7), 34)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        atk = min(1.0, t / 0.025)
        env = atk * math.exp(-t * 13)
        out[i] = sm[i] * env
    return [x * gain for x in out]


def correct(dur=0.62, gain=0.8):
    """答对：两个明亮上行音 G5 → C6（比 chime 更「对答案」，用于练习揭晓）"""
    n = int(SR * dur)
    out = [0.0] * n
    for k, note in enumerate([784, 1046]):
        start = int(k * 0.16 * SR)
        for i in range(int(0.42 * SR)):
            j = start + i
            if j >= n:
                break
            t = i / SR
            out[j] += (
                math.sin(2 * math.pi * note * t)
                + 0.35 * math.sin(2 * math.pi * note * 2 * t)
            ) * math.exp(-t * 7.5) * (0.5 if k == 0 else 0.62)
    return [x * gain for x in out]


def tick(dur=0.07, gain=0.55):
    """轻点：极短 click（条件行逐句点亮用，比 pop 更轻不抢口播）"""
    n = int(SR * dur)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        out[i] = math.sin(2 * math.pi * 1500 * t) * math.exp(-t * 70)
    for i in range(int(0.004 * SR)):
        out[i] += 0.3 * math.exp(-i / (0.0015 * SR))
    return [x * gain for x in out]


def riser(dur=0.9, gain=0.55):
    """升调悬念：频率加速上滑 + 噪声渐强（揭晓答案前 0.5-1s 拉满期待）"""
    n = int(SR * dur)
    out = [0.0] * n
    ph = 0.0
    for i in range(n):
        p = (i / SR) / dur
        f = 180 + 900 * (p * p)
        ph += 2 * math.pi * f / SR
        out[i] = math.sin(ph) * (p ** 1.6) * 0.6
    sm = lowpass(noise(n, 11), 6)
    for i in range(n):
        p = (i / SR) / dur
        out[i] += sm[i] * 0.35 * (p ** 2)
    return [x * gain for x in out]


def coin(dur=0.38, gain=0.7):
    """金币：两个高音短叮（E6 → B6），价格/钱相关题用"""
    n = int(SR * dur)
    out = [0.0] * n
    for k, f in enumerate([1318, 1975]):
        start = int(k * 0.06 * SR)
        for i in range(int(0.30 * SR)):
            j = start + i
            if j >= n:
                break
            t = i / SR
            out[j] += math.sin(2 * math.pi * f * t) * math.exp(-t * 16) * 0.7
    return [x * gain for x in out]


def boom(dur=0.7, gain=1.0):
    """重低音：低频下滑冲击（结论/口诀砸下来时用，给"重量"）"""
    n = int(SR * dur)
    out = [0.0] * n
    ph = 0.0
    for i in range(n):
        t = i / SR
        f = 110 * math.exp(-t * 3.2) + 38
        ph += 2 * math.pi * f / SR
        out[i] = math.sin(ph) * math.exp(-t * 4.5)
    click = noise(int(0.05 * SR), 5)
    for i in range(int(0.05 * SR)):
        out[i] += click[i] * math.exp(-i / (0.012 * SR)) * 0.5
    return [x * gain for x in out]


def error(dur=0.42, gain=0.6):
    """否定：两个低音下行（E4 → C4）+ 三次谐波做出"嘟"的方波感（讲易错点用）"""
    n = int(SR * dur)
    out = [0.0] * n
    for k, f in enumerate([330, 262]):
        start = int(k * 0.16 * SR)
        for i in range(int(0.26 * SR)):
            j = start + i
            if j >= n:
                break
            t = i / SR
            out[j] += (
                math.sin(2 * math.pi * f * t) + 0.3 * math.sin(2 * math.pi * f * 3 * t)
            ) * math.exp(-t * 9) * 0.55
    return [x * gain for x in out]


def sparkle(dur=0.8, gain=0.55):
    """闪光：一串高频短点错落散开（揭晓答案，比 chime 更亮）"""
    n = int(SR * dur)
    out = [0.0] * n
    rng = random.Random(23)
    for k, f in enumerate([1568, 2093, 2637, 3136, 2093, 2637]):
        start = int((k * 0.055 + rng.uniform(0, 0.03)) * SR)
        for i in range(int(0.22 * SR)):
            j = start + i
            if j >= n:
                break
            t = i / SR
            out[j] += math.sin(2 * math.pi * f * t) * math.exp(-t * 22) * 0.45
    return [x * gain for x in out]


def heartbeat(dur=1.0, gain=0.7):
    """心跳：两下低频脉冲（互动题"想一想"的悬念段做氛围）"""
    n = int(SR * dur)
    out = [0.0] * n
    for k, off in enumerate([0.0, 0.26]):
        start = int(off * SR)
        for i in range(int(0.3 * SR)):
            j = start + i
            if j >= n:
                break
            t = i / SR
            f = 62 * math.exp(-t * 10) + 28
            out[j] += math.sin(2 * math.pi * f * t) * math.exp(-t * 11) * (0.95 if k == 0 else 0.7)
    return [x * gain for x in out]


def spin(dur=0.42, gain=0.6):
    """转动：频率下滑 + 快速颤音，像东西转着落定（字旋转入场用）。
    whoosh 是噪声扫过、riser 是上滑悬念，都不是"转"的质感 —— 转要的是颤音 + 收尾定住。"""
    n = int(SR * dur)
    out = [0.0] * n
    ph = 0.0
    for i in range(n):
        t = i / SR
        p = t / dur
        f = 880 - 600 * (p ** 0.85)           # 880 → 280 Hz 下滑（转速衰减）
        ph += 2 * math.pi * f / SR
        trem = 0.6 + 0.4 * math.sin(2 * math.pi * 38 * t)  # 38Hz 颤音 = "转"的质感
        env = math.sin(math.pi * min(1.0, p * 1.12)) ** 0.75
        out[i] = math.sin(ph) * trem * env
        out[i] += 0.18 * math.sin(ph * 2) * trem * env      # 加二次谐波，亮一点
    return [x * gain for x in out]


if __name__ == "__main__":
    for i, f in enumerate([85, 105, 125, 145, 165]):
        write_wav(f"land{i+1}.wav", land(f, gain=0.9 - i * 0.05))
    write_wav("pop.wav", pop(gain=0.7))
    write_wav("pop_low.wav", pop_var(190, 600, dur=0.19, gain=0.75))   # 大元素（整行/整块）
    write_wav("pop_high.wav", pop_var(520, 1500, dur=0.13, gain=0.6))  # 小元素（小格/小标签）
    write_wav("whoosh.wav", whoosh(gain=0.5))
    write_wav("reveal.wav", reveal(gain=1.0))
    write_wav("chime.wav", chime(gain=0.8))
    write_wav("scribe.wav", scribe(gain=2.4))   # ⚠️ 原 gain 0.5 峰值仅 0.09，混在 0.4 音量下等于听不见
    write_wav("correct.wav", correct(gain=0.8))
    write_wav("tick.wav", tick(gain=0.55))
    write_wav("riser.wav", riser(gain=0.55))       # 揭晓前拉悬念
    write_wav("coin.wav", coin(gain=0.7))          # 钱/价格
    write_wav("boom.wav", boom(gain=0.6))         # ⚠️ 起振 click + 正弦叠加，gain>0.62 会削波          # 重低音砸下
    write_wav("error.wav", error(gain=0.6))        # 易错点/否定
    write_wav("sparkle.wav", sparkle(gain=0.55))   # 答案闪现
    write_wav("heartbeat.wav", heartbeat(gain=0.7))  # 悬念氛围
    write_wav("spin.wav", spin(gain=0.6))          # 转动（字旋转入场）
    print("done")
