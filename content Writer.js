import {
  FaAlignCenter,
  FaAlignJustify,
  FaAlignLeft,
  FaAlignRight,
  FaItalic,
  FaUnderline,
  FaHighlighter,
  FaListOl,
  FaRetweet,
} from "react-icons/fa";
import { BsCheckLg, BsFileImage, BsXLg } from "react-icons/bs";
import { FiBold } from "react-icons/fi";
import {
  MdLink,
  MdSubscript,
  MdSuperscript,
  MdOutlineFormatStrikethrough,
} from "react-icons/md";
import {
  ContentContainer,
  HeadContainer,
  HeadToolTip,
  HeadRow,
  TextInputContents,
  ViewContents,
  ContentEditer,
} from "./styled/Content.styled";
import React, {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";


const ContentWriter = forwardRef(({ theme, onSave }, ref) => {
  const _TextInputRef = useRef(null);
  const _FileInputRef = useRef(null);
  const [inputContent, setInputContent] = useState("");
  const [showContent, setShowContent] = useState(false);

  useImperativeHandle(ref, () => ({
    //set content and show
    setContent(_psContent) {
      setInputContent(_psContent);
      setShowContent((x) => !x);
    },
  }));

  const lSelectImage = async (e) => {
    const _index = lSelectIndex_o(); //get position
    if (_index.start !== _index.stop) return; //not select
    const src_b64 = await lGetImageURL_sb64(e.target.files[0]);
    setInputContent((x) => {
      return lReplaceIndex_s(
        x,
        _index.start,
        _index.stop,
        `<img src='${src_b64}'>`,
        "</img>"
      );
    });
  };

  const lGetImageURL_sb64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
  });

  const lSortHtmlTag_s = (_pText) => {
    const _addSlash_n_before_lessThen_arsHTML = (_psHTML) => {
      //add \n after >
      //add \n before < when before < is not \n
      if (_psHTML && !_psHTML.includes("<")) {
        console.log("Text is empty or not HTML");
        return;
      }

      let _retNewText = "";

      try {
        let _newText = "";
        for (let i = 0; i < _psHTML.length; i++) {
          if (_psHTML[i] === ">") {
            _newText += `${_psHTML[i]}\n`;
          } else {
            _newText += _psHTML[i];
          }
        }

        for (let i = 0; i < _newText.length; i++) {
          if (i >= 1 && _newText[i] === "<" && _newText[i - 1] !== "\n") {
            _retNewText += `\n${_newText[i]}`;
          } else {
            _retNewText += _newText[i];
          }
        }
      } catch (ex) {
        console.log(ex.message);
      }
      return _retNewText;
    };

    const _exactOnlyStartTag_sHTML = (_ptag_s) => {
      const _startTagPatturn = /\s.*/g; //new RegExp("\s.*", "g");
      const _startTag = _ptag_s.replace(_startTagPatturn, ">");
      if (_ptag_s.includes("/")) {
        //close tag
        return _ptag_s;
      }
      if (_startTag === null) {
        //string
        return _ptag_s;
      }
      return _startTag; //start tag
    };

    const _findCloseTag_b = (_psStartTag, _psStopTag, _psArr) => {
      if (_psArr.length === 0) return false;

      const _nStart = _psArr.filter(
        (x) => _exactOnlyStartTag_sHTML(x) === _psStartTag
      ).length;
      const _nStop = _psArr.filter((x) => x === _psStopTag).length;
      return (_nStart !== 0 || _nStop !== 0) && _nStart === _nStop;
    };

    const _isOpenTag = (_pHTML) => /[<]\w*(\s+.*)*[>]/g.test(_pHTML);
    const _isCloseTag = (_pHTML) => /[<]\/.*[>]/g.test(_pHTML);

    const _lReplaceSlasht = (
      _pnBackSlasht = 0,
      _pArrRef,
      _pnStartIndex,
      _pnStopIndex,
      _pArrRefNextIndex
    ) => {
      const _addSlashtn = (_pnSlansht, _pnIndex, _prefsArrayHTML) => {
        let __slashnt = "";
        if (_pnSlansht > 0) __slashnt = "\t".repeat(_pnSlansht);
        _prefsArrayHTML[_pnIndex] = `${__slashnt}${_prefsArrayHTML[_pnIndex]}`;
      };

      for (let i = _pnStartIndex; i < _pnStopIndex; i++) {
        //content outside tag
        if (
          !_pArrRef[_pnStartIndex].startsWith("\t") &&
          !_isOpenTag(_pArrRef[_pnStartIndex]) &&
          !_isCloseTag(_pArrRef[_pnStartIndex])
        ) {
          _addSlashtn(_pnBackSlasht, i, _pArrRef);
          _pArrRefNextIndex[i] = true;
        }

        if (
          _pArrRefNextIndex[i - 1] === false &&
          _isOpenTag(_pArrRef[i - 1]) === true
        ) {
          //prev isnot checked  index not marked
          i--; //back
          _pArrRefNextIndex[i] = true; //marked
        }

        if (_isOpenTag(_pArrRef[i]) === true) {
          //found open tag HTML <tag>
          const ___sOpenTag = _exactOnlyStartTag_sHTML(_pArrRef[i]);
          const ___Tag = ___sOpenTag.slice(1);
          const ___closeTag = `</${___Tag}`;
          for (let u = i + 1; u <= _pnStopIndex; u++) {
            if (
              _findCloseTag_b(___sOpenTag, ___closeTag, _pArrRef.slice(i, u))
            ) {
              //assign \t and \n
              _addSlashtn(_pnBackSlasht, i, _pArrRef); //starttag
              _addSlashtn(_pnBackSlasht, u - 1, _pArrRef); //stoptag
              _pArrRefNextIndex[i] = true;
              _pArrRefNextIndex[u - 1] = true;
              //inside tag
              const ____arTagInside = _pArrRef.slice(i + 1, u - 1);
              switch (
                ____arTagInside.length //<>....tag inside.....</>
              ) {
                case 0: //empty tag <a></a>
                  _lReplaceSlasht(
                    _pnBackSlasht,
                    _pArrRef,
                    u,
                    _pnStopIndex,
                    _pArrRefNextIndex
                  ); //<><+1>....tag inside.....<-1></+>
                  break;
                case 1: //content <>content</>
                  _pArrRefNextIndex[i + 1] = true;
                  _addSlashtn(_pnBackSlasht + 1, i + 1, _pArrRef);
                  _lReplaceSlasht(
                    _pnBackSlasht,
                    _pArrRef,
                    u,
                    _pnStopIndex,
                    _pArrRefNextIndex
                  ); //<><+1>....tag inside.....<-1></+>
                  return;
                default: //<><+1>....tag inside.....<-1></+>
                  //next
                  _lReplaceSlasht(
                    _pnBackSlasht +
                      (u >= _pArrRef.length - 2 ? u - _pArrRef.length + 1 : 1), //if end - 2
                    _pArrRef,
                    i + 1,
                    u - 1,
                    _pArrRefNextIndex
                  );

                  i = u;

                  if (
                    !_isOpenTag(_pArrRef[i]) &&
                    !_isCloseTag(_pArrRef[i]) &&
                    _pArrRefNextIndex[i] === false
                  ) {
                    //isnot open tag and close tag not marked
                    _addSlashtn(_pnBackSlasht, i, _pArrRef); //content after end tag
                    _pArrRefNextIndex[i] = true;
                  }
              }
            }
          }
        }
      }
    };

    //remove \n or \t
    const _removeBackSlash_n_and_t = _pText.replace(/\n|\t/g, "");
    //add \n brfore < and \n after >
    const _sHTML = _addSlash_n_before_lessThen_arsHTML(
      _removeBackSlash_n_and_t
    );
    //split \n into array [<p>,"content",</p>] then filter length > 0
    let _arHTML = _sHTML
      .split(/\n/gm)
      .map((x) => x.replace(/\r\n+|\n+|\r+|\t+/, ""))
      .filter((x) => x.length > 0);
    //mark added
    const _mark = [];
    for (let i = 0; i < _arHTML.length; i++) {
      _mark[i] = false;
    }
    //replace \t before tag
    _lReplaceSlasht(0, _arHTML, 0, _arHTML.length, _mark);
    //add \n all array and concat it to string
    _arHTML = _arHTML
      .map((x) => (x = x + "\n"))
      .reduce((previousValue, currentValue) => (previousValue += currentValue));
    return _arHTML;
  };

  const lSelectIndex_o = () => {
    return {
      start: _TextInputRef.current.selectionStart,
      stop: _TextInputRef.current.selectionEnd,
    };
  };

  const lReplaceIndex_s = (
    _pString,
    _pPosOneIndex,
    _pPosTwoIndex,
    _pNewString1,
    _pNewString2
  ) => {
    return (
      _pString.substring(0, _pPosOneIndex) +
      _pNewString1 +
      _pString.substring(_pPosOneIndex, _pPosTwoIndex) +
      _pNewString2 +
      _pString.substring(_pPosTwoIndex)
    );
  };

  const lTextDecoration = () => {
    const _index = lSelectIndex_o();
    if (_index.start === _index.stop) return;

    setInputContent((x) => {
      return lReplaceIndex_s(
        x,
        _index.start,
        _index.stop,
        "<span style='text-decoration:line-through;'>",
        "</span>"
      );
    });
  };

  const lSortHTML = () => {
    try {
      const _sSortedHTML = lSortHtmlTag_s(inputContent);
      setInputContent(_sSortedHTML);
    } catch (ex) {
      console.warn(ex.message);
    }
  };

  const lAlignJustify = () => {
    const _index = lSelectIndex_o(); //get position
    if (_index.start === _index.stop) return; //not selected

    setInputContent((x) => {
      const _repTaxt = lReplaceIndex_s(
        x,
        _index.start,
        _index.stop,
        "<div style='text-align: justify;'>",
        "</div>"
      );
      return _repTaxt;
    });
  };

  const lAlignLeft = () => {
    const _index = lSelectIndex_o();
    if (_index.start === _index.stop) return;

    setInputContent((x) => {
      return lReplaceIndex_s(
        x,
        _index.start,
        _index.stop,
        "<div style='text-align:left;'>",
        "</div>"
      );
    });
  };

  const lAlignCenter = () => {
    const _index = lSelectIndex_o();
    if (_index.start === _index.stop) return;

    setInputContent((x) => {
      return lReplaceIndex_s(
        x,
        _index.start,
        _index.stop,
        "<div style='text-align:center;'>",
        "</div>"
      );
    });
  };

  const lAlignRight = () => {
    const _index = lSelectIndex_o();
    if (_index.start === _index.stop) return;

    setInputContent((x) => {
      return lReplaceIndex_s(
        x,
        _index.start,
        _index.stop,
        "<div style='text-align:right;'>",
        "</div>"
      );
    });
  };

  const lBold = () => {
    const _index = lSelectIndex_o();
    if (_index.start === _index.stop) return;

    setInputContent((x) => {
      return lReplaceIndex_s(x, _index.start, _index.stop, "<b>", "</b>");
    });
  };

  const lItalic = () => {
    const _index = lSelectIndex_o();
    if (_index.start === _index.stop) return;

    setInputContent((x) => {
      return lReplaceIndex_s(x, _index.start, _index.stop, "<i>", "</i>");
    });
  };

  const lUnderLine = () => {
    const _index = lSelectIndex_o();
    if (_index.start === _index.stop) return;

    setInputContent((x) => {
      return lReplaceIndex_s(x, _index.start, _index.stop, "<u>", "</u>");
    });
  };

  const lLink = () => {
    const _index = lSelectIndex_o();
    if (_index.start === _index.stop) return;

    setInputContent((x) => {
      return lReplaceIndex_s(
        x,
        _index.start,
        _index.stop,
        "<a href='#replace_your_link_here'>",
        "</a>"
      );
    });
  };

  const lHighlighter = () => {
    const _index = lSelectIndex_o();
    if (_index.start === _index.stop) return;

    setInputContent((x) => {
      return lReplaceIndex_s(
        x,
        _index.start,
        _index.stop,
        "<span  style='background-color:lime;'>",
        "</span>"
      );
    });
  };

  const lOrder = () => {
    const _index = lSelectIndex_o();
    if (_index.start === _index.stop) return;

    const _selectString = inputContent.substring(_index.start, _index.stop);
    let _ul = inputContent
      .substring(_index.start, _index.stop)
      .split(" ")
      .map((x) => (x = `<li>${x}</li>`))
      .join(" ");
    _ul = `<ol type="1">${_ul}</ol>`;
    setInputContent((x) => x.replace(_selectString, _ul));
  };

  const lSup = () => {
    const _index = lSelectIndex_o();
    if (_index.start === _index.stop) return;

    setInputContent((x) => {
      return lReplaceIndex_s(x, _index.start, _index.stop, "<sup>", "</sup>");
    });
  };

  const lSub = () => {
    const _index = lSelectIndex_o();
    if (_index.start === _index.stop) return;

    setInputContent((x) => {
      return lReplaceIndex_s(x, _index.start, _index.stop, "<sub>", "</sub>");
    });
  };

  return (
    <ContentContainer
    {...theme}
      style={{ display: showContent === true ? "block" : "none" }}
    >
      <HeadContainer {...theme?.headContentner} >
        <HeadRow {...theme?.headRow} onClick={lAlignJustify}>
          <HeadToolTip  {...theme?.toolTip}>justify center</HeadToolTip>
          <FaAlignJustify />
        </HeadRow>
        <HeadRow {...theme?.headRow} onClick={lAlignLeft}>
          <HeadToolTip  {...theme?.toolTip} onClick={lAlignJustify}>align left</HeadToolTip>
          <FaAlignLeft />
        </HeadRow>
        <HeadRow {...theme?.headRow}  onClick={lAlignCenter}>
          <HeadToolTip {...theme?.toolTip}>align center</HeadToolTip>
          <FaAlignCenter />
        </HeadRow>
        <HeadRow {...theme?.headRow}  onClick={lAlignRight}>
          <HeadToolTip {...theme?.toolTip}>align right</HeadToolTip>
          <FaAlignRight />
        </HeadRow>
        <HeadRow {...theme?.headRow}  onClick={lBold}>
          <HeadToolTip {...theme?.toolTip}>bold</HeadToolTip>
          <FiBold />
        </HeadRow>
        <HeadRow {...theme?.headRow}  onClick={lItalic}>
          <HeadToolTip {...theme?.toolTip}>talic</HeadToolTip>
          <FaItalic />
        </HeadRow>
        <HeadRow {...theme?.headRow}  onClick={lUnderLine}>
          <HeadToolTip {...theme?.toolTip}>under line</HeadToolTip>
          <FaUnderline />
        </HeadRow>
        <HeadRow {...theme?.headRow}  onClick={lTextDecoration}>
          <HeadToolTip {...theme?.toolTip}>text decoration</HeadToolTip>
          <MdOutlineFormatStrikethrough />
        </HeadRow>
        <HeadRow {...theme?.headRow}  onClick={lLink}>
          <HeadToolTip {...theme?.toolTip}>link</HeadToolTip>
          <MdLink />
        </HeadRow>
        <HeadRow {...theme?.headRow}  onClick={lHighlighter}>
          <HeadToolTip {...theme?.toolTip}>highligh</HeadToolTip>
          <FaHighlighter />
        </HeadRow>
        <HeadRow {...theme?.headRow}  onClick={lOrder}>
          <HeadToolTip {...theme?.toolTip}>list</HeadToolTip>
          <FaListOl />
        </HeadRow>
        <HeadRow {...theme?.headRow}  onClick={lSub}>
          <HeadToolTip {...theme?.toolTip}>sub text</HeadToolTip>
          <MdSubscript />
        </HeadRow>
        <HeadRow {...theme?.headRow}  onClick={lSup}>
          <HeadToolTip {...theme?.toolTip}>sup text</HeadToolTip>
          <MdSuperscript />
        </HeadRow>
        <HeadRow
        {...theme?.headRow} 
          onClick={() => {
            _FileInputRef.current.click();
          }}
        >
          <input
            type={"file"}
            style={{ display: "none" }}
            accept={"audio/*,video/*,image/*"}
            ref={_FileInputRef}
            onChange={lSelectImage}
          />
          <HeadToolTip {...theme?.toolTip}> insert image</HeadToolTip>
          <BsFileImage />
        </HeadRow>
        <HeadRow {...theme?.headRow}  onClick={lSortHTML}>
          <HeadToolTip {...theme?.toolTip}>sort</HeadToolTip>
          <FaRetweet />
        </HeadRow>
        <HeadRow
        {...theme?.headRow} 
          onClick={() => {
            if (onSave) onSave(inputContent);
            setInputContent("");
            setShowContent((x) => !x);
          }}
        >
          <HeadToolTip {...theme?.toolTip}>save</HeadToolTip>
          <BsCheckLg />
        </HeadRow>
        <HeadRow
        {...theme?.headRow} 
          onClick={() => {
            setInputContent("");
            setShowContent((x) => !x);
          }}
        >
          <HeadToolTip {...theme?.toolTip}>close</HeadToolTip>
          <BsXLg />
        </HeadRow>
      </HeadContainer>
      <ContentEditer >
        <ViewContents {...theme?.viewContent} dangerouslySetInnerHTML={{ __html: inputContent }} />
        <TextInputContents
        {...theme?.textInput}
          ref={_TextInputRef}
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
        />
      </ContentEditer>
    </ContentContainer>
  );
});

export default ContentWriter;

/*
  let con = {
    theme: {
      bgColor:'gray',
      headContentner:{
        bgColor:'gray'
      },
      headRow:{
        fontColor:'pink',
        bgColor:'white'
      },
      toolTip:{
        fontColor:'black',
        bgColor:'green'
      },
      textInput:{
        bgColor:'white',
        fontSize:'20px'
      },
      viewContent:{
        bgColor:'white'
      }
    }
  };

        <button
        onClick={() => {
            refCon.current.setContent("skdljfslskdjfl;jksdf12333");
        }}
      >
        clickme style= display none
      </button>
      <ContentWriter
      {...con}
        ref={refCon}
        onSave={(p) => {
          console.log(p);
        }}
      />
*/
