import AppKit
let w=1275, h=1650
let bitmap=NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:w,pixelsHigh:h,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:0,bitsPerPixel:0)!
NSGraphicsContext.current=NSGraphicsContext(bitmapImageRep:bitmap)
func c(_ r:CGFloat,_ g:CGFloat,_ b:CGFloat)->NSColor { NSColor(srgbRed:r/255,green:g/255,blue:b/255,alpha:1) }
c(27,42,74).setFill(); NSRect(x:0,y:0,width:w,height:h).fill()
func txt(_ s:String,_ top:CGFloat,_ size:CGFloat,_ color:NSColor,_ bold:Bool=false){
 let p=NSMutableParagraphStyle();p.alignment = .center
 (s as NSString).draw(in:NSRect(x:100,y:CGFloat(h)-top-90,width:1075,height:90),withAttributes:[.font:NSFont(name:bold ? "Arial Bold":"Arial",size:size) ?? NSFont.systemFont(ofSize:size),.foregroundColor:color,.paragraphStyle:p])
}
txt("d3tech.agency",360,66,.white,true)
txt("SEO / GEO / AEO Audit Report",470,34,c(147,197,253))
txt("FULL AUDIT",555,22,.white)
for (i,item) in [("SEO","4 / 10","Needs work"),("GEO","5 / 10","On track"),("AEO","3 / 10","Needs work")].enumerated(){
 let x=CGFloat(125+i*350);(i==1 ? c(217,119,6):c(220,38,38)).setFill();NSBezierPath(roundedRect:NSRect(x:x,y:690,width:325,height:230),xRadius:8,yRadius:8).fill()
 let p=NSMutableParagraphStyle();p.alignment = .center
 for (s,y,sz,ht) in [(item.0,CGFloat(850),CGFloat(22),CGFloat(40)),(item.1,CGFloat(750),CGFloat(60),CGFloat(90)),(item.2,CGFloat(708),CGFloat(19),CGFloat(35))]{
  (s as NSString).draw(in:NSRect(x:x,y:y,width:325,height:ht),withAttributes:[.font:NSFont.systemFont(ofSize:sz,weight:.semibold),.foregroundColor:NSColor.white,.paragraphStyle:p])
 }
}
txt("1 November 2026",1210,22,c(148,163,184))
txt("Live baseline and implementation handoff",1270,23,c(147,197,253))
txt("Audit workflow by Alex Labat",1430,17,c(148,163,184))
try bitmap.representation(using:.png,properties:[:])!.write(to:URL(fileURLWithPath:"reports/cover.png"))
