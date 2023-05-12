import { /*AfterViewInit, */Component, ElementRef, EventEmitter, Inject, Injector, LOCALE_ID, OnInit, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { ChatService } from 'src/shared/services/chat-service/chat.service';
import moment from 'moment';

@Component({
  selector: 'app-video-call-dialog',
  templateUrl: './video-call-dialog.component.html',
  styleUrls: ['./video-call-dialog.component.scss']
})
export class VideoCallDialog implements OnInit {//, AfterViewInit {

  @ViewChild('videoChatContainer') videoChatContainer: ElementRef;
  @ViewChild('localVideo') localVideo: ElementRef;
  
  @Output() close = new EventEmitter();

  userData;
  workspaceData;
  chatData;
  
  localCaptureStream;

  localVideoOn = true;
  localAudioOn = true;
  chatOn = false;
  membersOn = true;

  canEdit = false;

  members = [];

  //-------------------------
  socket = io(environment.NOTIFICATIONS_BASE_URL, {
    secure: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 2000,
    randomizationFactor: 0.5,
    autoConnect: true,
    // transports: ['websocket'],
    upgrade: true
  });

  videoConstraints = {
    width: {
        min: 320,
        max: 1280
    },
    height: {
        min: 240,
        max: 720
    }
  };
  mediaConstraints = {
    video: this.videoConstraints,
    audio: this.localAudioOn
  };

  offerOptions = {
    offerToReceiveVideo: 1,
    offerToReceiveAudio: 1,
  };

  /**
   * Colección con los objetos RTCPeerConnection.
   * La clave es el ID del socket (de socket.io) del par remoto y el valor es el objeto RTCPeerConnection
   * de dicho par remoto.
   */
  peerConnections = {}; 

  localPeerId; //ID del socket del cliente
  // localStream;
  rtcPeerConnection; // Connection between the local device and the remote peer.

  // Servidores ICE usados. Solo servidores STUN en este caso.
  iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };
  //-------------------------

  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(LOCALE_ID) public locale: string,
    private injector: Injector,
    private utilityService: UtilityService,
    private chatService: ChatService,
    private mdDialogRef: MatDialogRef<VideoCallDialog>
  ) { }

  async ngOnInit(): Promise<void> {
    this.chatData = this.data.chatData;

    this.canEdit = this.data.canEdit;

    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    await this.initMembers();

    this.joinRoom(this.chatData?._id);
  }

  async initMembers() {
    if (!this.objectExists(this.chatData?._group)) {
      this.members = await this.chatData?.members;
      this.members = await this.members?.filter((member, index) => (this.members?.findIndex(m => m._user._id == member._user._id) == index));
    } else {
      this.members = await this.chatData?._group?._admins?.concat(this.chatData?._group?._members);
      this.members = await this.members?.filter((member, index) => (this.members?.findIndex(m => m._id == member._id) == index));
    }
  }

  onAssignedAdded(member: any) {
    if (this.chatData && !this.chatData.members) {
      this.chatData.members = [];
    }

    if (this.chatData && this.chatData?.id) {
      this.chatService.addMember(this.chatData?._id, member._id).catch(error => {
        this.utilityService.errorNotification('The member could not be added, please try later!');
        return;
      });
    }

    this.chatData.members.push({
      _user: member,
      joined_on: moment(),
      is_admin: false
    });

    this.initMembers();
  }

  onAssignedRemoved(event: any) {
    const memberToRemoveId = event.assigneeId;

    if (this.chatData && this.chatData?.id) {
      this.chatService.removeMember(this.chatData?._id, memberToRemoveId).catch(error => {
        this.utilityService.errorNotification('The member could not be removed, please try later!');
        return;
      });
    }

    const memberIndex = (this.chatData?.members) ? this.chatData?.members.findIndex(m => m._user._id == memberToRemoveId) : -1;

    if (memberIndex >= 0) {
      this.chatData?.members.splice(memberIndex, 1);
    }

    this.initMembers();
  }

  muteVideo() {
    this.localVideoOn = !this.localVideoOn;
    var tracks = this.localCaptureStream.getVideoTracks();
    for (var i = 0; i < tracks.length; i++) {
      tracks[i].enabled = this.localVideoOn;
      // var track = tracks[i];
      // track.stop();
    }
  }

  muteAudio() {
    this.localAudioOn = !this.localAudioOn;
    var tracks = this.localCaptureStream.getAudioTracks();
    for (var i = 0; i < tracks.length; i++) {
      tracks[i].enabled = this.localAudioOn;
      // var track = tracks[i];
      // track.stop();
    }
  }

  showHideChat() {
    this.chatOn = !this.chatOn;
  }

  showMembers() {
    this.membersOn = !this.membersOn;
  }

  copyLink() {
    // Create Selection Box
    let selBox = document.createElement('textarea');

    // Set the CSS Properties
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';

    let url = environment.clientUrl;
    if (environment.production) {
      url += '/' + this.locale;
    }
    
    url += '/videoChat/' + this.chatData?._id;
    
    selBox.value = url;
    // Append the element to the DOM
    document.body.appendChild(selBox);

    // Set the focus and Child
    selBox.focus();
    selBox.select();

    // Execute Copy Command
    document.execCommand('copy');

    // Once Copied remove the child from the dom
    document.body.removeChild(selBox);

    // Show Confirmed notification
    this.utilityService.simpleNotification($localize`:@@videoCallDialog.copiedToClipboard:Copied to Clipboard!`);
  }

  leaveMeeting() {
    var tracks = this.localCaptureStream.getTracks();
    for (var i = 0; i < tracks.length; i++) {
      var track = tracks[i];
      track.stop();
    }
  }

  closeModal() {

    this.leaveMeeting();

    this.close.emit(this.chatData?._id);
    this.mdDialogRef.close();
  }

  //---------------------------------------

  private async joinRoom(room) {

    await this.setLocalStream(this.mediaConstraints);
    
    if (room === '') {
      alert('Please type a room ID');
    } else {
      // this.chatId = room
      this.socket.emit('join', {room: this.chatData?._id, peerUUID: this.localPeerId});
    }

    // SOCKET EVENT CALLBACKS =====================================================

    /**
     * Mensaje room_created recibido al unirse a una sala vacía
     */
    this.socket.on('room_created', async (event) => {
      this.localPeerId = event.peerId;
      await this.setLocalStream(this.mediaConstraints);
    })

    /**
     * Mensaje room_joined al unirse a una sala con pares conectados. Comienza la llamada enviando
     * start_call
     */
    this.socket.on('room_joined', async (event) => {
      this.localPeerId = event.peerId;
      await this.setLocalStream(this.mediaConstraints);
      this.socket.emit('start_call', {
        roomId: this.chatData?._id,
        senderId: this.localPeerId
      });
    });

    /**
     * Mensaje start_call recibido y crea el objeto RTCPeerConnection para enviar la oferta al otro par
     */
    this.socket.on('start_call', async (event) => {
      const remotePeerId = event.senderId;

      this.peerConnections[remotePeerId] = new RTCPeerConnection(this.iceServers);
      this.addLocalTracks(this.peerConnections[remotePeerId]);
      this.peerConnections[remotePeerId].ontrack = (event) => this.setRemoteStream(event, remotePeerId);
      this.peerConnections[remotePeerId].oniceconnectionstatechange = (event) => this.checkPeerDisconnect(event, remotePeerId);
      this.peerConnections[remotePeerId].onicecandidate = (event) => this.sendIceCandidate(event, remotePeerId);
      await this.createOffer(this.peerConnections[remotePeerId], remotePeerId);
    });

    /**
     * Mensaje webrtc_offer recibido con la oferta y envía la respuesta al otro par
     */
    this.socket.on('webrtc_offer', async (event) => {
      const remotePeerId = event.senderId;

      this.peerConnections[remotePeerId] = new RTCPeerConnection(this.iceServers);
      this.peerConnections[remotePeerId].setRemoteDescription(new RTCSessionDescription(event.sdp));
      this.addLocalTracks(this.peerConnections[remotePeerId]);

      this.peerConnections[remotePeerId].ontrack = (event) => this.setRemoteStream(event, remotePeerId);
      this.peerConnections[remotePeerId].oniceconnectionstatechange = (event) => this.checkPeerDisconnect(event, remotePeerId);
      this.peerConnections[remotePeerId].onicecandidate = (event) => this.sendIceCandidate(event, remotePeerId);
      await this.createAnswer(this.peerConnections[remotePeerId], remotePeerId);
    });

    /**
     * Mensaje webrtc_answer recibido y termina el proceso offer/answer.
     */
    this.socket.on('webrtc_answer', async (event) => {
      this.peerConnections[event.senderId].setRemoteDescription(new RTCSessionDescription(event.sdp));
      //addLocalTracks(peerConnections[event.senderId]);
    });

    /**
     * Mensaje webrtc_ice_candidate. Candidato ICE recibido de otro par
     */
    this.socket.on('webrtc_ice_candidate', (event) => {
      const senderPeerId = event.senderId;

      // ICE candidate configuration.
      var candidate = new RTCIceCandidate({
        sdpMLineIndex: event.label,
        candidate: event.candidate,
      });
      this.peerConnections[senderPeerId].addIceCandidate(candidate);
    });
  }

  /**
   * Recoge el stream local multimedia usando API getUserMedia
   */
  private async setLocalStream(mediaConstraints) {
    try {
      this.localCaptureStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);

      //-------------
      var context = new AudioContext();
      var sineWave = context.createOscillator();

      // Declare gain node
      var gainNode = context.createGain();

      // Connect sine wave to gain node
      sineWave.connect(gainNode);

      // Connect gain node to speakers
      gainNode.connect(context.destination);

      // Play sine wave
      sineWave.setPeriodicWave(0);
      gainNode.gain.value = 0.9;
    } catch(err) {
      console.error(err.message);
    }
  }

  /**
   * Añade un stream multimedia al objeto RTCPeerConnection recibido
   */
  private addLocalTracks(rtcPeerConnection) {
    this.localCaptureStream.getTracks().forEach((track) => {
      rtcPeerConnection.addTrack(track, this.localCaptureStream);
    });
  }

  /**
   * Crea la oferta con la información SDP y la envía con el mensaje webrtc_offer
   */
  private async createOffer(rtcPeerConnection, remotePeerId) {
    let sessionDescription;
    try {
      sessionDescription = await rtcPeerConnection.createOffer(this.offerOptions);
      rtcPeerConnection.setLocalDescription(sessionDescription);
    } catch (error) {
      console.error(error);
    }

    this.socket.emit('webrtc_offer', {
      type: 'webrtc_offer',
      sdp: sessionDescription,
      chatId: this.chatData?._id,
      senderId: this.localPeerId,
      receiverId: remotePeerId
    })
  }

  /**
   * Crea la respuesta con la información SDP y la envía con el mensaje webrtc_answer
   */
  private async createAnswer(rtcPeerConnection, remotePeerId) {
    let sessionDescription;
    try {
      sessionDescription = await rtcPeerConnection.createAnswer(this.offerOptions);
      rtcPeerConnection.setLocalDescription(sessionDescription);
    } catch (error) {
      console.error(error);
    }

    this.socket.emit('webrtc_answer', {
      type: 'webrtc_answer',
      sdp: sessionDescription,
      chatId: this.chatData?._id,
      senderId: this.localPeerId,
      receiverId: remotePeerId
    });
  }

  /**
   * Callback cuando se recibe el stream multimedia del par remoto
   */
  private setRemoteStream(event, remotePeerId) {
    if(event.track.kind == "video") {
      const videoREMOTO = document.createElement('video');
      videoREMOTO.srcObject = event.streams[0];
      videoREMOTO.id = 'remotevideo_' + remotePeerId;
      videoREMOTO.setAttribute('autoplay', '');
      videoREMOTO.style.maxWidth = '300px';
      this.videoChatContainer.nativeElement.append(videoREMOTO);
    } 
  }

  /**
   * Envía el candidato ICE recibido del cuando se recibe el evento onicecandidate del objeto RTCPeerConnection
   */
  private sendIceCandidate(event, remotePeerId) {
    if (event.candidate) {
      this.socket.emit('webrtc_ice_candidate', {
        senderId: this.localPeerId,
        receiverId: remotePeerId,
        chatId: this.chatData?._id,
        label: event.candidate.sdpMLineIndex,
        candidate: event.candidate.candidate,
      });
    }
  }

  /**
   * Comprueba si el par se ha desconectado cuando recibe el evento onicestatechange del objeto RTCPeerConnection
   */
  private checkPeerDisconnect(event, remotePeerId) {
    var state = this.peerConnections[remotePeerId].iceConnectionState;
    if (state === "failed" || state === "closed" || state === "disconnected") {
      //Se eliminar el elemento de vídeo del DOM si se ha desconectado el par
      const videoDisconnected = document.getElementById('remotevideo_' + remotePeerId);
      videoDisconnected.remove();
    }
  }

  objectExists(object: any) {
    return this.utilityService.objectExists(object);
  }
}
