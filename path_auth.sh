python3 << 'EOF'
with open('src/screens/AuthScreen.jsx', 'r') as f:
    content = f.read()

old = """      const imageData=ctx.getImageData(0,0,w,h), data=imageData.data;
      for(let i=0;i<data.length;i+=4){
        const n=(Math.random()-0.5)*16;
        data[i]=Math.min(255,Math.max(0,data[i]+n));
        data[i+1]=Math.min(255,Math.max(0,data[i+1]+n));
        data[i+2]=Math.min(255,Math.max(0,data[i+2]+n));
      }
      ctx.putImageData(imageData,0,0);"""

content = content.replace(old, "")

with open('src/screens/AuthScreen.jsx', 'w') as f:
    f.write(content)
print("Grain loop removed")
EOF
