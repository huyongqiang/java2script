package swingjs.api.js;

import java.awt.JSComponent;
import java.util.Hashtable;

import javajs.api.JSFunction;
//import javajs.util.JSThread;
import swingjs.api.js.JSSwingMenu;


/** 
 * called by JSmol JavaScript methods using
 * 
 *  this._applet.xxxx()
 *  
 */
public interface J2SInterface {

	void _jsSetMouse(DOMNode frameNode, boolean isSSwingJS);

	void _jsUnsetMouse(DOMNode frameNode);

	HTML5Applet _findApplet(String htmlName);

	String _getJavaVersion();

	void _readyCallback(String appId, String fullId, boolean isReady, 
			Object javaApplet, Object javaAppletPanel);

//	void _setAppletThread(String appletName, JSThread myThread);

	Object _getFileData(String fileName, Object fSuccess, boolean doProcess, boolean isBinary);

	void _setDraggable(DOMNode tagNode, Object targetNodeOrFDown);
	
	void _setDragDropTarget(JSComponent target, DOMNode node, boolean adding);

	int _setWindowZIndex(DOMNode domNode, int pos);

	void _getFileFromDialog(JSFunction f, String type);

	void _saveFile(String fileName, Object data, String mimeType, String encoding);

	String _getResourcePath(String resourceName, boolean isJavaPath);

	Object _getJavaResource(String resourceName, boolean isJavaPath);

	boolean _isResourceLoaded(String file, boolean done);

	Hashtable<String, Object> _getSetJavaFileCache(Object object);

	JSSwingMenu _getSwing();

	String _processResource(String path, Object data);

	/**
	 * 
	 * @param isAll true for check of navigator; otherwise just J2S._lang from j2sLang=xx_XX in URI
	 * @return
	 */
	String _getDefaultLanguage(boolean isAll);
	
	int _getKeyModifiers(Object jQueryEvent);
}

