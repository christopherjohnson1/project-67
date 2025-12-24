import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { GameNode } from '../../../core/models/game-node.model';
import { GameProgressService } from '../../../shared/services/game-progress.service';
import { Subscription } from 'rxjs';

/**
 * Game Board Component
 * Displays the treasure hunt map with interactive nodes and animated avatar
 */
@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss'],
  animations: [
    trigger('avatarMove', [
      state('*', style({ transform: 'translate({{x}}%, {{y}}%)' }), { params: { x: 0, y: 0 } }),
      transition('* => *', [
        animate('1500ms cubic-bezier(0.4, 0, 0.2, 1)'),
      ]),
    ]),
    trigger('nodeAppear', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
  ],
})
export class GameBoardComponent implements OnInit, OnDestroy {
  nodes: GameNode[] = [];
  currentNodeId: string = '';
  avatarPosition = { x: 0, y: 0 };
  
  private progressSubscription?: Subscription;

  constructor(private readonly gameProgressService: GameProgressService) {}

  ngOnInit(): void {
    this.initializeNodes();
    this.subscribeToProgress();
  }

  ngOnDestroy(): void {
    this.progressSubscription?.unsubscribe();
  }

  private initializeNodes(): void {
    // Define game board nodes (percentage-based positioning)
    this.nodes = [
      {
        id: 'start',
        position: { x: 10, y: 85 },
        status: 'current',
        locationName: 'Starting Beach',
        description: 'Your adventure begins here',
      },
      {
        id: 'temple-1',
        position: { x: 25, y: 65 },
        status: 'unlocked',
        locationName: 'Ancient Temple',
        description: 'A mysterious temple awaits',
      },
      {
        id: 'waterfall',
        position: { x: 15, y: 40 },
        status: 'locked',
        locationName: 'Hidden Waterfall',
        description: 'Follow the sound of water',
      },
      {
        id: 'pyramid',
        position: { x: 50, y: 35 },
        status: 'locked',
        locationName: 'Golden Pyramid',
        description: 'The treasure lies within',
      },
      {
        id: 'temple-2',
        position: { x: 75, y: 30 },
        status: 'locked',
        locationName: 'Sky Temple',
        description: 'Among the clouds',
      },
      {
        id: 'cave',
        position: { x: 65, y: 70 },
        status: 'locked',
        locationName: 'Skull Cave',
        description: 'Danger awaits the brave',
      },
      {
        id: 'treasure',
        position: { x: 85, y: 55 },
        status: 'locked',
        locationName: 'Final Treasure',
        description: 'The ultimate prize',
      },
    ];

    // Set initial avatar position to current node
    const currentNode = this.nodes.find(n => n.status === 'current');
    if (currentNode) {
      this.avatarPosition = { ...currentNode.position };
      this.currentNodeId = currentNode.id;
    }
  }

  private subscribeToProgress(): void {
    this.progressSubscription = this.gameProgressService.progress$.subscribe(progress => {
      if (progress) {
        this.updateNodesFromProgress(progress.currentNodeId, progress.completedNodes, progress.unlockedNodes);
      }
    });
  }

  private updateNodesFromProgress(currentNodeId: string, completedNodes: string[], unlockedNodes: string[]): void {
    this.nodes = this.nodes.map(node => ({
      ...node,
      status: this.getNodeStatus(node.id, currentNodeId, completedNodes, unlockedNodes),
    }));

    // Update avatar position
    const currentNode = this.nodes.find(n => n.id === currentNodeId);
    if (currentNode) {
      this.avatarPosition = { ...currentNode.position };
      this.currentNodeId = currentNodeId;
    }
  }

  private getNodeStatus(
    nodeId: string,
    currentNodeId: string,
    completedNodes: string[],
    unlockedNodes: string[]
  ): GameNode['status'] {
    if (completedNodes.includes(nodeId)) return 'completed';
    if (nodeId === currentNodeId) return 'current';
    if (unlockedNodes.includes(nodeId)) return 'unlocked';
    return 'locked';
  }

  onNodeClick(node: GameNode): void {
    if (node.status === 'locked') {
      console.log('Node is locked:', node.locationName);
      return;
    }

    // Emit event or open location detail modal
    console.log('Node clicked:', node);
    // TODO: Open location detail modal
  }

  getNodeClass(node: GameNode): string {
    return `node node--${node.status}`;
  }
}

