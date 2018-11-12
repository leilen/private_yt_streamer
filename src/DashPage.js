import React, { Component, Fragment } from "react";
import { UseConsume } from './MainProvider.js'

import Modal from './templates/Modal.js';

import Select2 from 'react-select2-wrapper';

import 'react-select2-wrapper/css/select2.css';
import '../public/css/dash.css';


import {
    getSelf,
    startLoading,
    finLoading,
    unWrapToArray,
    getSelectedValuesFromSelect2,
    unWrapToString,
    secondToString
} from './utils/shared_functions.js';


class DashPage extends Component {
    constructor(props, context) {
        super(props);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.loadDataFunc = this.loadDataFunc.bind(this);
        this.onInputFormTextChange = this.onInputFormTextChange.bind(this);
        this.initAllState = this.initAllState.bind(this);
        this.playButtonAction = this.playButtonAction.bind(this);
        this.stopButtonAction = this.stopButtonAction.bind(this);
        this.selectOnChange = this.selectOnChange.bind(this);
        this.addButtonAction = this.addButtonAction.bind(this);
        this.addUrlPostButtonAction = this.addUrlPostButtonAction.bind(this);
        this.listClickAction = this.listClickAction.bind(this);
        this.volumeClickAction = this.volumeClickAction.bind(this);
        this.backgroundOnClickAction = this.backgroundOnClickAction.bind(this);
        this.inputFormOnKeyPress = this.inputFormOnKeyPress.bind(this);
        this.volumePostAction = this.volumePostAction.bind(this);
        this.editListButtonAction = this.editListButtonAction.bind(this);
        this.timerFunction = this.timerFunction.bind(this);
        this.setCurrentUrl = this.setCurrentUrl.bind(this);

        this.addUrlModalRef = React.createRef();
        this.addUrlInputRef = React.createRef();
        this.volumeSpanRef = React.createRef();
        this.volumeInputRef = React.createRef();

        this.isVolumeInputFirstFocus = false;

        this.state = {
            isVolumeEditable : false,
            isListEditable : false,
            inputText: {},
            data: {},
            select: {
            },
            currentSecond : 0,
            currentUrl :null
        };

        this.timer = null;
        this.playStartedTime = null;


    }
    componentDidMount() {
        document.addEventListener('click', this.backgroundOnClickAction);
    }
    componentWillUnmount() {
        document.removeEventListener('click', this.backgroundOnClickAction);
    }
    componentDidUpdate(){
        if (this.state.isVolumeEditable){
            if (this.isVolumeInputFirstFocus){
                this.isVolumeInputFirstFocus = false;
                this.volumeInputRef.current.select();
            }
        }
      }
    loadDataFunc(data) {
        if (data["is-playing"] && data["play-started-time"]){
            this.playStartedTime = data["play-started-time"];
            if (!this.timer){
                this.timerFunction();
                this.timer = setInterval(this.timerFunction, 1000);
            }
        }
        
        this.setState({
            data: data
        });
        this.setCurrentUrl()
        finLoading();
    }
    onInputFormTextChange(e) {
        const name = e.target.name
        if (name) {
            this.setState({
                inputText: {
                    ...this.state.inputText,
                    [name]: e.target.value
                }
            });
        }
    }
    inputFormOnKeyPress(e){
        if (e.target.name == "volume" && e.key === 'Enter') {
            this.volumePostAction();
        }
    }
    initAllState() {
        this.setState({
        });
    }
    playButtonAction(url) {
        startLoading();
        let jsonData = {isPlay : true}
        if (url){
            jsonData["url"] = url
        }
    }
    stopButtonAction() {
        startLoading();
        let jsonData = {isPlay : false}
    }
    addButtonAction() {
        this.addUrlModalRef.current.showModal();
        this.setState({
            inputText:{
                ...this.state.inputText,
                addUrl : ""
            }
        })
        this.addUrlInputRef.current.focus();
        
    }
    addUrlPostButtonAction(){
        if (!/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/.test(this.state.inputText.addUrl)){
            alert("YouTube URL을 입력해야됩니다.")
            return;
        }
        const self = this;
        startLoading();
        
        let jsonData = {
            "isAdd" : true,
            "url" : this.state.inputText.addUrl
        }
        this.addUrlModalRef.current.hideModal();
    }
    listClickAction(url,e){
        if (confirm("이 곡을 재생할까요?")){
            this.playButtonAction(url);
        }
    }
    selectOnChange(e) {
        const name = e.target.name;
        if (name == "mode"){
            startLoading();
        }
    }
    volumeClickAction(){
        if (!this.state.isVolumeEditable){
            this.setState({
                isVolumeEditable : true,
                inputText : {
                    ...this.state.inputText,
                    volume : this.state.data["play-status"]["volume"] * 10
                }
            })
            this.isVolumeInputFirstFocus = true;
        }
    }
    backgroundOnClickAction(e){
        const currentTarget = e.target;
        if (!this.volumeSpanRef.current.contains(currentTarget)){
            if (this.state.isVolumeEditable){
                this.setState({
                    isVolumeEditable : false
                })
            }
        }
    }
    volumePostAction(){
        const self = this;
        startLoading();
        const volumeFloat = parseFloat(this.state.inputText.volume);
        if (!(volumeFloat && volumeFloat >= 0 && volumeFloat <= 10)){
            finLoading();
            alert("볼륨 값은 0 ~ 10만 가능합니다");
            this.setState({
                isVolumeEditable : false
            })
            return;
        }
        let jsonData = {
            "vol" : this.state.inputText.volume / 10
        }
    }
    editListButtonAction(){
        this.setState({
            isListEditable : !this.state.isListEditable
        })
    }
    deleteButtonAction(url,e){
        e.stopPropagation();
        if (confirm("이 곡을 삭제할까요?")){
            startLoading();

            let jsonData = {
                "isAdd" : false,
                "url" : url
            }
        }
    }
    timerFunction(){
        if (this.playStartedTime){
            let sum = Math.floor(((new Date().getTime()) - this.playStartedTime)/1000)
            if (this.state.currentUrl){
                sum = sum >= this.state.currentUrl["seconds"] ? this.state.currentUrl["seconds"] : sum
            }
            this.setState({
                currentSecond : sum
            })
        }
    }
    setCurrentUrl(){
        for (let v of unWrapToArray(this.state.data["url-list"])){
            if (v["url"] == this.state.data["play-status"]["current_url"]){
                this.state.currentUrl = v;
                this.setState({
                    currentUrl : v
                })
                break;
            }
        }
    }
    render() {
        const { inputText, data } = this.state;
        return (
            <Fragment onClick={this.backgroundOnClickAction}>
                {
                    this.state.currentUrl && (
                        <div class="row attendance-button-row">
                            <div className="play-view">
                                {
                                    this.state.currentUrl["th"] &&(
                                        <div className="play-th">
                                            <img src={this.state.currentUrl["th"]}/>
                                        </div>
                                    )
                                }
                                <div className="play-info">
                                    <div className="title">{this.state.currentUrl ? this.state.currentUrl.title : ""}</div>
                                    <div className="current-time">{secondToString(this.state.currentSecond)} / {this.state.currentUrl && secondToString(this.state.currentUrl["seconds"])}</div>
                                </div>
                            </div>
                        </div>
                    )
                }
                <div class="row attendance-button-row">
                    {
                        data["is-playing"] ? (<button type="button" class="btn btn-danger btn-lg play-controll" onClick={this.stopButtonAction}><i class="fa fa-stop"/></button>) : (<button type="button" class="btn btn-success btn-lg play-controll" onClick={this.playButtonAction.bind(this,null)}><i class="fa fa-play"/></button>)
                    }
                    <span ref={this.volumeSpanRef} className="active clickable" onClick={this.volumeClickAction}>volume : {this.state.isVolumeEditable ? (<input ref={this.volumeInputRef} id="volume" type="text" name="volume" value={this.state.inputText.volume} onChange={this.onInputFormTextChange} onKeyPress={this.inputFormOnKeyPress}/>) : data["play-status"] ? data["play-status"]["volume"] * 10 : ""} </span>
                    {
                        this.state.data["play-status"] &&(
                            <select class="form-control mode" value={this.state.select.mode} onChange={this.selectOnChange} name="mode">
                                <option selected={this.state.data["play-status"]["mode"] == 0} value={0}>Normal</option>
                                <option selected={this.state.data["play-status"]["mode"] == 1} value={1}>Repeat</option>
                                <option selected={this.state.data["play-status"]["mode"] == 2} value={2}>Random</option>
                            </select>
                        )
                    }

                </div>
                <div class="row music-list-row">
                    <div class="col-lg-6">
                        <div class="panel panel-default">
                            <div class="panel-heading">
                                <i class="fa fa-user fa-fw"></i> 음악 목록
                                <div class="pull-right">
                                    {   
                                        !this.state.isListEditable &&
                                        (<button type="button" class="btn btn-info btn-xs" onClick={this.addButtonAction}><i class="fa fa-plus"/></button>)
                                    }
                                    {   this.state.isListEditable ?
                                        (<button type="button" class="btn btn-success btn-xs" onClick={this.editListButtonAction}>완료</button>) :
                                        (<button type="button" class="btn btn-warning btn-xs" onClick={this.editListButtonAction}>편집</button>)
                                    }
                                </div>
                            </div>
                            <div class="panel-body">
                                <div class="list-group">
                                    {
                                        unWrapToArray(data["url-list"]).map((v, i) => {
                                            return (
                                                <div class={`list-group-item url-list clickable ${v["url"] == data["play-status"]["current_url"] ? "active" : ""}`} onClick={this.listClickAction.bind(this,v["url"])}>
                                                    <span className="title">{v["title"]}</span>
                                                    {   
                                                        this.state.isListEditable ?
                                                        (<button type="button" class="btn btn-danger btn-xs" onClick={this.deleteButtonAction.bind(this,v["url"])}><i class="fa fa-remove"/></button>) :
                                                        (<span class="pull-right text-muted small time"><em>{secondToString(v['seconds'])}</em></span>)
                                                    }
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <Modal
                    id="addUrlModalRef"
                    title="리스트 추가"
                    ref={this.addUrlModalRef}>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>YouTube URL</label>
                            <input ref={this.addUrlInputRef} type="text" class="form-control" value={inputText.addUrl} onChange={this.onInputFormTextChange} name="addUrl" />
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">닫기</button>
                        <button type="button" class="btn btn-primary" onClick={this.addUrlPostButtonAction}>추가하기</button>
                    </div>
                </Modal>
            </Fragment>
        );
    }
}


export default UseConsume(DashPage);