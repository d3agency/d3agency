import AppKit

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("public")
try FileManager.default.createDirectory(at: root.appendingPathComponent("og"), withIntermediateDirectories: true)
func color(_ hex: UInt32) -> NSColor { NSColor(srgbRed: CGFloat((hex >> 16) & 255)/255, green: CGFloat((hex >> 8) & 255)/255, blue: CGFloat(hex & 255)/255, alpha: 1) }
let ink = color(0x292A30), blue = color(0x616882), muted = color(0x545D70)
func render(_ size: NSSize, to file: URL, drawing: (CGFloat) -> Void) throws {
    let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(size.width), pixelsHigh: Int(size.height), bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
    drawing(size.height)
    NSGraphicsContext.restoreGraphicsState()
    try bitmap.representation(using: .png, properties: [:])!.write(to: file)
}
func text(_ value: String, x: CGFloat, top: CGFloat, width: CGFloat, height: CGFloat, size: CGFloat, weight: NSFont.Weight, color: NSColor, canvas: CGFloat) {
    let paragraph = NSMutableParagraphStyle(); paragraph.lineSpacing = 0
    let attrs: [NSAttributedString.Key: Any] = [.font: NSFont.systemFont(ofSize: size, weight: weight), .foregroundColor: color, .paragraphStyle: paragraph, .kern: -size * 0.035]
    (value as NSString).draw(in: NSRect(x:x, y:canvas-top-height, width:width, height:height), withAttributes: attrs)
}
let variants = [
    ("home", "Your next idea.\nBuilt to work.", "WEBSITES  /  WEB APPS  /  AUTOMATION")
]
for (slug, title, subtitle) in variants {
    try render(NSSize(width:1200,height:630), to:root.appendingPathComponent("og/\(slug).png")) { h in
        color(0xDCEAF7).setFill(); NSRect(x:0,y:0,width:1200,height:h).fill()
        color(0xD2E4F5).setFill(); NSBezierPath(roundedRect:NSRect(x:980,y:-100,width:400,height:400), xRadius:200,yRadius:200).fill()
        text("d3",x:64,top:44,width:100,height:80,size:62,weight:.bold,color:ink,canvas:h)
        text("agency",x:153,top:72,width:200,height:40,size:28,weight:.medium,color:ink,canvas:h)
        blue.setFill(); NSBezierPath(ovalIn:NSRect(x:1064,y:h-114,width:64,height:64)).fill()
        text("↗",x:1077,top:61,width:42,height:48,size:32,weight:.medium,color:.white,canvas:h)
        text(subtitle,x:68,top:172,width:1050,height:40,size:18,weight:.semibold,color:muted,canvas:h)
        text(title,x:64,top:235,width:1070,height:245,size:76,weight:.medium,color:ink,canvas:h)
        blue.setFill(); NSRect(x:68,y:112,width:1060,height:2).fill()
        text("D3 Agency · Websites, web apps & automation",x:68,top:548,width:800,height:40,size:22,weight:.regular,color:muted,canvas:h)
        text("d3tech.agency",x:937,top:548,width:220,height:40,size:22,weight:.medium,color:blue,canvas:h)
    }
}
for (name,size) in [("logo.png",512),("apple-touch-icon.png",180)] {
    try render(NSSize(width:size,height:size),to:root.appendingPathComponent(name)) { h in
        blue.setFill(); NSRect(x:0,y:0,width:h,height:h).fill()
        text("d3",x:h*0.14,top:h*0.16,width:h*0.8,height:h*0.7,size:h*0.55,weight:.bold,color:.white,canvas:h)
    }
}
print("Generated homepage social card, logo and touch icon in the original palette.")
