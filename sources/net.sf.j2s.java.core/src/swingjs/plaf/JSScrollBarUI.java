package swingjs.plaf;

import java.awt.Dimension;
import java.beans.PropertyChangeEvent;

import javax.swing.JScrollBar;
import javax.swing.event.ChangeEvent;
import swingjs.api.js.DOMNode;

/**
 * The SwingjJS implementation of a JScrollBar utilizes all the JSSlider
 * capabilities. It adds an variable extent (handle size) and also has 
 * a different appearance. 
 * 
 *  TODO: block and unit increments. Right now it just tracks to where the 
 *  mouse was clicked. 
 *  
 * @author hansonr
 *
 */
public class JSScrollBarUI extends JSSliderUI {

	JSScrollPaneUI myScrollPaneUI;
	
	private boolean isInvisible;

	public JSScrollBarUI() {
		super();
		isScrollBar = true;
	}

	@Override
	public void propertyChange(PropertyChangeEvent e) {
		super.propertyChange(e);		
		if (debugging) 
					System.out.println(id + " propertyChange " + dumpEvent(e));
	}

	@Override
	public void stateChanged(ChangeEvent e) {
		super.stateChanged(e);
		setScrollBarExtentAndCSS();
		if (debugging) 
					System.out.println(id + " stateChange " + dumpEvent(e));
	}


	@Override
	public Dimension getPreferredSize() {
		// thin because we are implementing jquery slider here
		int wh = (myScrollPaneUI == null ? 15 : myScrollPaneUI.scrollBarUIDisabled ? 0 : 15);
		// just used for width or height, but not both. I think.... 
		return new Dimension(wh, wh);
	}
	
	@Override
	public void setVisible(boolean b) {
		isInvisible = (myScrollPaneUI != null && myScrollPaneUI.scrollBarUIDisabled);
		b &= !isInvisible;
		DOMNode.setVisible(getOuterNode(), b);
		DOMNode.setVisible(jqSlider, b);
	}

	/**
	 * The scrollbar handle size is set in the j2sSlider jQuery component
	 * as a fraction, since the slider track is not the same size
	 * as the JScrollBar component. Could be done other ways and just
	 * send the extent, I suppose. We fall back to 0.1 if anything is wrong. 
	 * 
	 */
	@Override
	void setScrollBarExtentAndCSS() {
		String left;
		String top;
		JScrollBar sb = (JScrollBar) jc; 
		int extent = sb.getVisibleAmount();
		int max = sb.getMaximum();
		int min = sb.getMinimum();
		float f = (extent > 0 && max > min && extent <= max - min 
				? extent * 1f / (max - min) : 0.1f);
		setSliderAttr("handleSize", f);
		if (myScrollPaneUI == null) {
			// in 
			left = "3px";
			top = "3px";
		} else {
			left = "0px";
			top = "0px";
		}
		if (orientation == "vertical") {
			DOMNode.setStyles(sliderTrack, "left", left, "width", "12px", "background", "lightgrey");
			DOMNode.setStyles(sliderHandle, "left", "-1px", "margin-bottom", "0px");
		} else {
			DOMNode.setStyles(sliderTrack, "top", top, "height", "12px", "background", "lightgrey");
			DOMNode.setStyles(sliderHandle, "top", "-1px", "margin-left", "0px");
		}
	}

}



