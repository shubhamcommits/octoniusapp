import { /*AfterViewInit, */ChangeDetectorRef, Component, ComponentRef, ElementRef, EventEmitter, Inject, Injector, LOCALE_ID, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { ChatService } from 'src/shared/services/chat-service/chat.service';
import { DateTime } from 'luxon';
import { RemoteVideoComponent } from '../remote-video/remote-video.component';

@Component({
  selector: 'app-video-call-dialog',
  templateUrl: './video-call-dialog.component.html',
  styleUrls: ['./video-call-dialog.component.scss']
})
export class VideoCallDialog implements OnInit {//, AfterViewInit {

  @ViewChild("videoChatContainer", { read: ViewContainerRef }) videoChatContainer: ViewContainerRef;
  @ViewChild('localVideo') localVideo: ElementRef;
  
  @Output() close = new EventEmitter();
  
  public remoteVideoComponentRefs: ComponentRef<RemoteVideoComponent>[] = []

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
  audioConstraints = {
      echoCancellation: { exact: true }
    }

  mediaConstraints = {
    video: this.videoConstraints,
    audio: this.audioConstraints
  };

  offerOptions = {
    offerToReceiveVideo: 1,
    offerToReceiveAudio: 1,
  };

  /**
   * Colection with objets RTCPeerConnection.
   * The key is the ID of the socket (from socket.io) from the remote peer
   * and the value is the object RTCPeerConnection of the remote peer
   */
  peerConnections = {};
  onlineUsers = [];

  localPeerId; //ID socket of client
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
    private changeDetectorRef: ChangeDetectorRef,
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

    this.onlineUsers = [{ _id: this.userData?._id, name: this.userData?.first_name + ' ' + this.userData?.last_name }];

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

  setOnlineMembers() {
    this.members.forEach(member => member.isOnline = (((this.onlineUsers) ? this.onlineUsers.findIndex(user => user._id == member._user._id) : -1) != -1));
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
      joined_on: DateTime.now(),
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
      // alert('Please type a room ID');
    } else {
      this.socket.emit('join', {
        room: this.chatData?._id,
        peerUUID: this.localPeerId,
        user: {
          _id: this.userData?._id,
          name: this.userData?.first_name + ' ' + this.userData?.last_name,
          profile_pic: this.userData?.profile_pic,
          workspaceId: this.workspaceData?._id
        }
      });
    }

    // SOCKET EVENT CALLBACKS =====================================================

    /**
     * Message room_created received when joining to an empty room
     */
    this.socket.on('room_created', async (event) => {
      this.localPeerId = event.peerId;
      await this.setLocalStream(this.mediaConstraints, event.user);
    })

    /**
     * Message room_joined when joining to a room with connected peers.
     * Starts the call sending start_call
     */
    this.socket.on('room_joined', async (event) => {
      this.localPeerId = event.peerId;
      await this.setLocalStream(this.mediaConstraints);
      this.socket.emit('start_call', {
        roomId: this.chatData?._id,
        senderId: this.localPeerId,
        user: {
          _id: this.userData?._id,
          name: this.userData?.first_name + ' ' + this.userData?.last_name,
          profile_pic: this.userData?.profile_pic,
          workspaceId: this.workspaceData?._id
        }
      });
    });

    /**
     * Message start_call received and create another object RTCPeerConnection to send the offer to other peer
     */
    this.socket.on('start_call', async (event) => {
      const remotePeerId = event.senderId;
      const user = event.user;

      this.peerConnections[remotePeerId] = new RTCPeerConnection(this.iceServers);
      this.addLocalTracks(this.peerConnections[remotePeerId]);
      this.peerConnections[remotePeerId].ontrack = (event) => this.setRemoteStream(event, user, remotePeerId);
      this.peerConnections[remotePeerId].oniceconnectionstatechange = (event) => this.checkPeerDisconnect(event, user, remotePeerId);
      this.peerConnections[remotePeerId].onicecandidate = (event) => this.sendIceCandidate(event, remotePeerId);
      await this.createOffer(this.peerConnections[remotePeerId], remotePeerId);
    });

    /**
     * Message webrtc_offer received with offer and sends the response to other peer
     */
    this.socket.on('webrtc_offer', async (event) => {
      const remotePeerId = event.senderId;
      const user = event.user;

      this.peerConnections[remotePeerId] = new RTCPeerConnection(this.iceServers);
      this.peerConnections[remotePeerId].setRemoteDescription(new RTCSessionDescription(event.sdp));
      this.addLocalTracks(this.peerConnections[remotePeerId]);

      this.peerConnections[remotePeerId].ontrack = (event) => this.setRemoteStream(event, user, remotePeerId);
      this.peerConnections[remotePeerId].oniceconnectionstatechange = (event) => this.checkPeerDisconnect(event, user, remotePeerId);
      this.peerConnections[remotePeerId].onicecandidate = (event) => this.sendIceCandidate(event, remotePeerId);
      await this.createAnswer(this.peerConnections[remotePeerId], remotePeerId);
    });

    /**
     * Message webrtc_answer received and ends the proccess offer/answer.
     */
    this.socket.on('webrtc_answer', async (event) => {
      this.peerConnections[event.senderId].setRemoteDescription(new RTCSessionDescription(event.sdp));
    });

    /**
     * Message webrtc_ice_candidate. Candidate ICE received from other peer
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
   * Multimedia local Stream using API getUserMedia
   */
  private async setLocalStream(mediaConstraints, user?: any) {
    try {
      this.localCaptureStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);

      if (user) {
        this.onlineUsers.push(user);
        this.utilityService.removeDuplicates(this.onlineUsers, '_id').then((users) => {
          this.onlineUsers = users;
        });

        this.setOnlineMembers();
      }
    } catch(err) {
      console.error(err.message);
    }
  }

  /**
   * Add a multimedia stream to object RTCPeerConnection received
   */
  private addLocalTracks(rtcPeerConnection) {
    this.localCaptureStream.getTracks().forEach((track) => {
      rtcPeerConnection.addTrack(track, this.localCaptureStream);
    });
  }

  /**
   * Create the offer with the information SDP and sends it with the message webrtc_offer
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
      user: {
        _id: this.userData?._id,
        name: this.userData?.first_name + ' ' + this.userData?.last_name,
        profile_pic: this.userData?.profile_pic,
        workspaceId: this.workspaceData?._id
      },
      senderId: this.localPeerId,
      receiverId: remotePeerId
    })
  }

  /**
   * Create a response with the information SDP and send it with the message webrtc_answer
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
   * Callback when a multimedia stream is received from remote peer
   */
  private async setRemoteStream(event, user, remotePeerId) {
    if(event.track.kind == "video") {
      let componentRef = this.videoChatContainer.createComponent<RemoteVideoComponent>(RemoteVideoComponent);
      componentRef.instance.remoteUser = user;
      componentRef.instance.stream = event.streams[0];
      componentRef.instance.id = 'remotevideo_' + remotePeerId;
      // componentRef.instance.isCameraOn = this.localVideoOn;
      this.remoteVideoComponentRefs.push(componentRef);
      this.changeDetectorRef.detectChanges()
    }

    if (user) {
      this.onlineUsers.push(user);
      this.utilityService.removeDuplicates(this.onlineUsers, '_id').then((users) => {
        this.onlineUsers = users;
      });

      this.setOnlineMembers();
    }
  }

  /**
   * Send the candidate ICE received when the event onicecandidate is received from object  RTCPeerConnection
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
   * Check if the peer has disconected when receive the event onicestatechange from object RTCPeerConnection
   */
  private checkPeerDisconnect(event, user, remotePeerId) {
    var state = this.peerConnections[remotePeerId].iceConnectionState;
    if (state === "failed" || state === "closed" || state === "disconnected") {
      const videoDisconnected = document.getElementById('remotevideo_' + remotePeerId).parentElement;
      videoDisconnected.remove();
      const index = (this.onlineUsers) ? this.onlineUsers.findIndex(u => u._id == user._id) : -1;
      this.onlineUsers.splice(index, 1);
      this.setOnlineMembers();
    }
  }

  objectExists(object: any) {
    return this.utilityService.objectExists(object);
  }
}
